"""
Apply labeling Excel values to ground-truth JSONs.

Reads `output/reports/유사도_라벨링.xlsx` (sheet: `라벨링_작성`) and updates:
  data/labels/ground_truth/**.json
by setting each person's `patient_id_gt` from Excel column `수동라벨_입력`.

This does NOT re-run `match`. It only synchronizes manual labels into GT.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

import sys

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

import settings as CFG
from labeling.constants import GT_SCHEMA_VERSION, VALID_GT_LABELS, LABEL_DONE, LABEL_PENDING
from labeling.gt_io import gt_path_for_image, load_all_ground_truths, validate_gt_label
from preprocessing.gallery_index import load_gallery_index


def _norm_image_id(v: Any) -> str:
    s = "" if v is None else str(v)
    return s.replace("\\", "/").strip()


def _build_alt_image_id_to_gt_path() -> dict[str, Path]:
    """
    Map (excel's `image_id`, which may be legacy/original) -> GT JSON path.

    We reuse the same idea as `face/excel_reports.py`:
    a GT image_id can correspond to multiple gallery_index aliases.
    """

    entries = load_gallery_index().get("entries", [])
    idx_to_ids: dict[int, set[str]] = {}
    for e in entries:
        idx = int(e.get("index"))
        ids = set()
        for key in ("image_id", "legacy_image_id", "original_image_id", "gallery_path", "preprocessed_path"):
            v = e.get(key)
            if v:
                ids.add(_norm_image_id(v))
        idx_to_ids[idx] = ids

    # For each GT json, figure out which index set contains its image_id,
    # then map all aliases in that set to this GT json path.
    out: dict[str, Path] = {}
    for gt in load_all_ground_truths():
        gt_img = _norm_image_id(gt.get("image_id", ""))
        if not gt_img:
            continue
        gt_path = gt_path_for_image(gt_img)

        # Always map the GT image_id itself.
        out[gt_img] = gt_path

        for _, id_set in idx_to_ids.items():
            if gt_img in id_set:
                for alt in id_set:
                    out[alt] = gt_path

    return out


def _infer_columns(df: pd.DataFrame) -> dict[str, str]:
    """
    Work around potential mojibake in header rendering:
    we use *position* based inference, falling back to heuristics.
    """

    cols = list(df.columns)
    if len(cols) >= 24:
        # Expected order from face/excel_reports.py LABELING_COLUMNS_KO
        return {
            "global_index": cols[0],
            "image_id": cols[1],
            "program_label": cols[2],
            "program_id": cols[3],
            "face_index": cols[4],
            "status": cols[5],
            "predicted_patient": cols[6],
            "gt_label": cols[17],
            "manual_label": cols[18],
            "label_status": cols[19],
        }

    # Heuristic fallback (should rarely be needed)
    out: dict[str, str] = {}
    for c in cols:
        if "ID" in str(c):
            # pick the one that looks like image_id (contains '/' later)
            out["image_id"] = c
        if "얼굴" in str(c) or "face" in str(c).lower():
            out["face_index"] = c
    if "image_id" in out and "face_index" in out:
        # manual label: pick column whose non-null values intersect allowed labels
        for c in cols:
            sample = df[c].dropna().astype(str).head(50).tolist()
            s = set(sample)
            if any(v in VALID_GT_LABELS for v in s):
                out["manual_label"] = c
                break
    return out


def _set_person_label(gt: dict[str, Any], face_index: int, patient_id_gt: str, labeled_by: str | None, now_iso: str) -> bool:
    """Return True if a matching person_index was found."""
    found = False
    for person in gt.get("persons", []):
        if int(person.get("person_index")) == face_index:
            person["patient_id_gt"] = patient_id_gt
            found = True
            break

    if not found:
        return False

    # Update overall status based on whether all persons are labeled with a valid GT label.
    persons = gt.get("persons", [])
    all_labeled = True
    for p in persons:
        if not validate_gt_label(p.get("patient_id_gt")):
            all_labeled = False
            break

    gt["label_status"] = LABEL_DONE if all_labeled else LABEL_PENDING

    if all_labeled:
        gt["labeled_at"] = gt.get("labeled_at") or now_iso
        if labeled_by:
            gt["labeled_by"] = gt.get("labeled_by") or labeled_by

    return True


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--excel-path",
        default=str(CFG.OUTPUT_REPORTS_DIR / "유사도_라벨링.xlsx"),
        help="Labeling workbook path",
    )
    parser.add_argument(
        "--sheet-name",
        default="라벨링_작성",
        help="Sheet name to read manual labels from",
    )
    parser.add_argument("--labeled-by", default=None, help="Optional labeled_by value for GT json")
    parser.add_argument("--dry-run", action="store_true", help="Print what would change, do not write files")
    args = parser.parse_args()

    excel_path = Path(args.excel_path)
    if not excel_path.is_file():
        raise FileNotFoundError(f"Excel not found: {excel_path}")

    df = pd.read_excel(excel_path, sheet_name=args.sheet_name)
    if df.empty:
        print("[오류] 엑셀 시트가 비어있습니다.")
        return

    cols = _infer_columns(df)
    required = {"image_id", "face_index", "manual_label"}
    missing = required - set(cols.keys())
    if missing:
        raise RuntimeError(f"Cannot infer required columns from excel. missing={missing} cols={list(df.columns)}")

    alt_map = _build_alt_image_id_to_gt_path()

    now_iso = datetime.now().astimezone().isoformat(timespec="seconds")

    gt_cache: dict[Path, dict[str, Any]] = {}
    n_rows = 0
    n_applied = 0
    n_missing_gt = 0
    n_unknown_labels = 0

    manual_col = cols["manual_label"]
    img_col = cols["image_id"]
    face_col = cols["face_index"]

    for _, row in df.iterrows():
        n_rows += 1
        manual = row.get(manual_col)
        if pd.isna(manual):
            continue
        manual = str(manual).strip()
        if manual == "" or manual.lower() == "nan":
            continue

        # Dropdown includes "ignore"; we simply skip it.
        if manual == "ignore":
            continue

        # Only allow labels that are valid GT labels.
        if not validate_gt_label(manual):
            n_unknown_labels += 1
            continue

        excel_img = _norm_image_id(row.get(img_col))
        if not excel_img:
            continue

        try:
            face_index = int(row.get(face_col))
        except Exception:
            continue

        gt_path = alt_map.get(excel_img)
        if not gt_path or not gt_path.is_file():
            n_missing_gt += 1
            continue

        if gt_path not in gt_cache:
            import json

            gt_cache[gt_path] = json.loads(gt_path.read_text(encoding="utf-8"))

        gt = gt_cache[gt_path]

        ok = _set_person_label(
            gt=gt,
            face_index=face_index,
            patient_id_gt=manual,
            labeled_by=args.labeled_by,
            now_iso=now_iso,
        )
        if ok:
            n_applied += 1

    # Write back
    if args.dry_run:
        print("[DRY RUN] rows:", n_rows)
        print("[DRY RUN] applied labels:", n_applied)
        print("[DRY RUN] missing gt json:", n_missing_gt)
        print("[DRY RUN] unknown/invalid labels:", n_unknown_labels)
        print("[DRY RUN] would write:", len(gt_cache))
        return

    import json

    written = 0
    for p, v in gt_cache.items():
        # ensure schema_version exists
        v.setdefault("schema_version", GT_SCHEMA_VERSION)
        p.write_text(json.dumps(v, ensure_ascii=False, indent=2), encoding="utf-8")
        written += 1

    print("[완료]")
    print("  rows:", n_rows)
    print("  applied labels:", n_applied)
    print("  missing gt json:", n_missing_gt)
    print("  unknown/invalid labels:", n_unknown_labels)
    print("  written GT json files:", written)


if __name__ == "__main__":
    main()

