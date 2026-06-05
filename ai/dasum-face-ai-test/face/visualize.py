"""Draw face match results on gallery (raw + preprocessed)."""

from __future__ import annotations

from pathlib import Path

import cv2
import pandas as pd

import schema as S
import settings as CFG
from face.detector import FaceDetector
from face.io_utils import load_image_bgr, save_image_bgr
from preprocessing.gallery_index import entry_by_index, image_id_to_index, load_gallery_index


def _draw_detections(img, faces_det: pd.DataFrame) -> None:
    for _, row in faces_det.iterrows():
        if pd.isna(row.get("bbox_x1")):
            continue
        x1, y1, x2, y2 = map(
            int, [row["bbox_x1"], row["bbox_y1"], row["bbox_x2"], row["bbox_y2"]]
        )
        cv2.rectangle(img, (x1, y1), (x2, y2), (255, 180, 0), 2)


def _draw_labels(img, group: pd.DataFrame, faces_det: pd.DataFrame) -> None:
    for _, m in group.iterrows():
        if m.get("status") == S.IDENTITY_NO_FACE:
            continue
        det_row = faces_det[faces_det["face_index"] == m["face_index"]]
        if det_row.empty or pd.isna(det_row.iloc[0].get("bbox_x1")):
            continue
        dr = det_row.iloc[0]
        x1, y1 = int(dr["bbox_x1"]), int(dr["bbox_y1"])
        label = (
            f"F{int(m['face_index'])} {m.get('predicted_patient')} "
            f"{m.get('top1_similarity')} {m.get('status')}"
        )
        cv2.putText(
            img,
            str(label)[:60],
            (x1, max(y1 - 8, 16)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (0, 255, 0),
            2,
        )


def _resolve_image_id(row: pd.Series, id_map: dict[str, int]) -> str:
    for col in ("image_id", "original_image_id"):
        v = row.get(col)
        if v is not None and not (isinstance(v, float) and pd.isna(v)):
            return str(v).replace("\\", "/")
    return ""


def visualize_matches(sim_df: pd.DataFrame, overwrite: bool = True) -> dict[str, int]:
    """
    Save numeric filenames under:
      output/visualized/gallery_preprocessed/{index}.png
      output/visualized/gallery/{index}.png
    """
    CFG.OUTPUT_VIS_GALLERY_DIR.mkdir(parents=True, exist_ok=True)
    CFG.OUTPUT_VIS_PREPROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    if overwrite:
        for d in (CFG.OUTPUT_VIS_GALLERY_DIR, CFG.OUTPUT_VIS_PREPROCESSED_DIR):
            for p in d.glob("*.png"):
                p.unlink()

    det_path = CFG.OUTPUT_REPORTS_DIR / "face_detection_results.csv"
    det_df = pd.read_csv(det_path) if det_path.is_file() else pd.DataFrame()

    entries = entry_by_index()
    id_map = image_id_to_index()

    # Group similarity rows by global index (supports legacy + numeric image_id)
    by_index: dict[int, pd.DataFrame] = {}
    for image_id in sim_df["image_id"].unique():
        key = str(image_id).replace("\\", "/")
        idx = id_map.get(key)
        if idx is None:
            continue
        chunk = sim_df[sim_df["image_id"] == image_id]
        if idx in by_index:
            by_index[idx] = pd.concat([by_index[idx], chunk], ignore_index=True)
        else:
            by_index[idx] = chunk

    detector: FaceDetector | None = None
    counts = {"gallery_preprocessed": 0, "gallery": 0}

    for idx in sorted(entries.keys()):
        ent = entries[idx]
        image_id = ent.get("image_id") or ent.get("preprocessed_path")
        group = by_index.get(idx)
        if group is None:
            continue

        det_ids = {image_id}
        for alt in (ent.get("legacy_image_id"), ent.get("original_image_id")):
            if alt:
                det_ids.add(str(alt).replace("\\", "/"))
        faces_det = (
            det_df[det_df["image_id"].astype(str).str.replace("\\", "/", regex=False).isin(det_ids)]
            if len(det_df)
            else pd.DataFrame()
        )

        # --- preprocessed (bboxes from detection CSV) ---
        pre_src = CFG.GALLERY_PREPROCESSED_DIR / Path(str(image_id))
        if pre_src.is_file():
            try:
                img_pre = load_image_bgr(pre_src)
                _draw_detections(img_pre, faces_det)
                _draw_labels(img_pre, group, faces_det)
                save_image_bgr(CFG.OUTPUT_VIS_PREPROCESSED_DIR / f"{idx}.png", img_pre)
                counts["gallery_preprocessed"] += 1
            except Exception:
                pass

        # --- raw gallery (detect on raw; same face_index order by area) ---
        gal_src = CFG.GALLERY_RAW_DIR / Path(ent.get("gallery_path") or image_id)
        if gal_src.is_file():
            try:
                if detector is None:
                    detector = FaceDetector()
                img_raw = load_image_bgr(gal_src)
                raw_faces = detector.detect(img_raw)
                raw_det_rows = []
                for fi, face in enumerate(raw_faces, start=1):
                    raw_det_rows.append(
                        {
                            "face_index": fi,
                            "bbox_x1": face.bbox[0],
                            "bbox_y1": face.bbox[1],
                            "bbox_x2": face.bbox[2],
                            "bbox_y2": face.bbox[3],
                        }
                    )
                raw_det = pd.DataFrame(raw_det_rows)
                _draw_detections(img_raw, raw_det)
                _draw_labels(img_raw, group, raw_det)
                save_image_bgr(CFG.OUTPUT_VIS_GALLERY_DIR / f"{idx}.png", img_raw)
                counts["gallery"] += 1
            except Exception:
                pass

    return counts
