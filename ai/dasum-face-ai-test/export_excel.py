import json
from collections import Counter
from pathlib import Path

from openpyxl import Workbook

import sys

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from labeling.constants import VALID_PATIENT_LABELS
from labeling.gt_io import load_ground_truth, validate_gt_label


def gt_matches_pred(gt_label: str, p: dict) -> bool | None:
    if not validate_gt_label(gt_label):
        return None
    status = p.get("identity_status")
    pid = p.get("patient_id")
    if gt_label in VALID_PATIENT_LABELS:
        return status == "MATCHED" and pid == gt_label
    if gt_label == "unknown":
        return status == "UNKNOWN"
    if gt_label == "no_face":
        return status == "NO_FACE"
    return None

INPUT_JSON = ROOT / "output" / "analysis_result.json"
FACE_SIM_CSV = ROOT / "output" / "reports" / "face_similarity_results.csv"


def main() -> None:
    if FACE_SIM_CSV.is_file():
        import pandas as pd

        from face.review_exporter import export_similarity_reports

        df = pd.read_csv(FACE_SIM_CSV)
        paths = export_similarity_reports(df)
        print("[완료] Excel / CSV 리포트:")
        for k, v in sorted(paths.items()):
            print(f"  {k}: {v}")
        print("\n라벨링: output/reports/유사도_라벨링.xlsx 시트 '라벨링_작성' -> 수동라벨_입력")
        return

    data = json.loads(INPUT_JSON.read_text(encoding="utf-8"))
    images = data.get("images", [])

    # Build a stable list of patients (patient_1..patient_6) if present in scores.
    patient_ids = []
    for img in images:
        for p in img.get("persons", []):
            scores = p.get("patient_scores") or {}
            for pid in scores.keys():
                if pid not in patient_ids:
                    patient_ids.append(pid)
    patient_ids.sort(key=lambda x: (x.split("_")[0], int(x.split("_")[1]) if "_" in x and x.split("_")[1].isdigit() else 999))

    wb = Workbook()

    ws = wb.active
    ws.title = "사람별"

    header = [
        "이미지ID",
        "사람수",
        "사람번호",
        "예측상태",
        "예측환자",
        "예측유사도",
        "정답(라벨)",
        "정답여부",
    ] + [f"{pid} 유사도" for pid in patient_ids]
    ws.append(header)

    # Summary per image
    ws_img = wb.create_sheet("이미지별")
    ws_img.append(
        [
            "이미지ID",
            "배경여부(person없음)",
            "사람수",
            "MATCHED수",
            "UNKNOWN수",
            "NO_FACE수",
        ]
    )

    for img in images:
        image_id = img.get("image_id")
        person_count = img.get("person_count", 0)
        is_background = bool(img.get("is_background", False))

        c = Counter([p.get("identity_status") for p in img.get("persons", [])])
        ws_img.append(
            [
                image_id,
                is_background,
                person_count,
                int(c.get("MATCHED", 0)),
                int(c.get("UNKNOWN", 0)),
                int(c.get("NO_FACE", 0)),
            ]
        )

        if is_background and not img.get("persons"):
            ws.append(
                [image_id, person_count, None, "BACKGROUND", None, None, None, None]
                + [None] * len(patient_ids)
            )
            continue

        gt = load_ground_truth(image_id) if image_id else None
        gt_by_index = {}
        if gt:
            for g in gt.get("persons", []):
                gt_by_index[g["person_index"]] = g.get("patient_id_gt")

        for p in img.get("persons", []):
            scores = p.get("patient_scores") or {}
            idx = p.get("person_index")
            gt_label = gt_by_index.get(idx)
            row = [
                image_id,
                person_count,
                idx,
                p.get("identity_status"),
                p.get("patient_id") or "unknown",
                p.get("similarity"),
                gt_label,
                gt_matches_pred(gt_label, p) if gt_label else None,
            ]
            for pid in patient_ids:
                row.append(scores.get(pid))
            ws.append(row)

    # Simple formatting: freeze header rows
    ws.freeze_panes = "A2"
    ws_img.freeze_panes = "A2"

    OUTPUT_XLSX.parent.mkdir(parents=True, exist_ok=True)
    wb.save(OUTPUT_XLSX)
    print(str(OUTPUT_XLSX))


if __name__ == "__main__":
    main()

