"""Detect faces in preprocessed activity (gallery) images."""

from __future__ import annotations

import shutil
from pathlib import Path

import numpy as np
import pandas as pd

import schema as S
import settings as CFG
from face.detector import FaceDetector
from face.embedder import l2_normalize
from face.io_utils import (
    iter_images,
    load_image_bgr,
    program_info_from_rel,
    save_image_bgr,
    setup_logger,
)
from preprocessing.gallery_index import load_gallery_index


def _clear_dir(path: Path) -> None:
    if path.exists():
        shutil.rmtree(path)
    path.mkdir(parents=True, exist_ok=True)


def detect_activity_faces(overwrite: bool = False) -> pd.DataFrame:
    log = setup_logger("detect_faces", CFG.OUTPUT_LOGS_DIR / "face_detection.log")

    if not CFG.GALLERY_PREPROCESSED_DIR.is_dir():
        raise FileNotFoundError(
            f"gallery_preprocessed 없음: {CFG.GALLERY_PREPROCESSED_DIR}\n"
            "먼저: python main.py --step preprocess"
        )

    if overwrite:
        _clear_dir(CFG.ACTIVITY_CROPS_DIR)
        _clear_dir(CFG.ACTIVITY_ALIGNED_DIR)
    else:
        CFG.ACTIVITY_CROPS_DIR.mkdir(parents=True, exist_ok=True)
        CFG.ACTIVITY_ALIGNED_DIR.mkdir(parents=True, exist_ok=True)

    detector = FaceDetector()
    rows: list[dict] = []
    index_data = load_gallery_index()
    pre_to_legacy = {
        e["preprocessed_path"]: e.get("legacy_image_id")
        or e.get("original_image_id")
        for e in index_data.get("entries", [])
    }
    global_idx_by_pre = {e["preprocessed_path"]: e["index"] for e in index_data.get("entries", [])}

    for rel, src_path in iter_images(CFG.GALLERY_PREPROCESSED_DIR):
        program_id, program_label = program_info_from_rel(rel)
        image_id = rel
        original_image_id = pre_to_legacy.get(rel) or rel
        global_index = global_idx_by_pre.get(rel)
        if global_index is None:
            try:
                global_index = int(Path(rel).stem)
            except ValueError:
                global_index = 0
        stem = str(global_index)

        try:
            image = load_image_bgr(src_path)
        except Exception as e:
            log.warning("load fail %s: %s", rel, e)
            rows.append(
                {
                    "image_id": image_id,
                    "original_image_id": original_image_id,
                    "global_index": global_index,
                    "source_image": str(src_path).replace("\\", "/"),
                    "program_id": program_id,
                    "program_label": program_label,
                    "face_index": 0,
                    "status": S.IDENTITY_FAILED,
                    "det_score": None,
                    "bbox_x1": None,
                    "bbox_y1": None,
                    "bbox_x2": None,
                    "bbox_y2": None,
                    "crop_path": None,
                    "aligned_face_path": None,
                    "memo": str(e),
                }
            )
            continue

        faces = detector.detect(image)
        if not faces:
            rows.append(
                {
                    "image_id": image_id,
                    "original_image_id": original_image_id,
                    "global_index": global_index,
                    "source_image": str(src_path).replace("\\", "/"),
                    "program_id": program_id,
                    "program_label": program_label,
                    "face_index": 0,
                    "status": S.IDENTITY_NO_FACE,
                    "det_score": None,
                    "bbox_x1": None,
                    "bbox_y1": None,
                    "bbox_x2": None,
                    "bbox_y2": None,
                    "crop_path": None,
                    "aligned_face_path": None,
                    "memo": None,
                }
            )
            log.info("[NO_FACE] %s", rel)
            continue

        # largest first -> face_index 1..N
        # filename is numeric-only (e.g. 31_1.jpg)
        for idx, face in enumerate(faces, start=1):
            crop_rel = Path(program_id) / f"{stem}_{idx}.jpg"
            aligned_rel = Path(program_id) / f"{stem}_{idx}.jpg"
            crop_path = CFG.ACTIVITY_CROPS_DIR / crop_rel
            aligned_path = CFG.ACTIVITY_ALIGNED_DIR / aligned_rel

            try:
                crop = FaceDetector.crop_bbox(image, face)
                aligned = FaceDetector.align_crop(image, face)
                save_image_bgr(crop_path, crop)
                save_image_bgr(aligned_path, aligned)
                emb_path = aligned_path.with_suffix(".npy")
                if face.embedding is not None:
                    np.save(
                        emb_path,
                        l2_normalize(np.asarray(face.embedding, dtype=np.float32)),
                    )
                else:
                    emb_path = None
            except Exception as e:
                log.warning("save fail %s face%d: %s", rel, idx, e)
                rows.append(
                    {
                    "image_id": image_id,
                    "original_image_id": original_image_id,
                    "global_index": global_index,
                    "source_image": str(src_path).replace("\\", "/"),
                    "program_id": program_id,
                    "program_label": program_label,
                    "face_index": idx,
                    "status": S.IDENTITY_FAILED,
                    "det_score": face.det_score,
                        "bbox_x1": face.bbox[0],
                        "bbox_y1": face.bbox[1],
                        "bbox_x2": face.bbox[2],
                        "bbox_y2": face.bbox[3],
                        "crop_path": None,
                        "aligned_face_path": None,
                        "memo": str(e),
                    }
                )
                continue

            rows.append(
                {
                    "image_id": image_id,
                    "original_image_id": original_image_id,
                    "global_index": global_index,
                    "source_image": str(src_path).replace("\\", "/"),
                    "program_id": program_id,
                    "program_label": program_label,
                    "face_index": idx,
                    "status": "DETECTED",
                    "det_score": round(face.det_score, 4),
                    "bbox_x1": round(face.bbox[0], 1),
                    "bbox_y1": round(face.bbox[1], 1),
                    "bbox_x2": round(face.bbox[2], 1),
                    "bbox_y2": round(face.bbox[3], 1),
                    "crop_path": str(crop_path.relative_to(CFG.ROOT)).replace("\\", "/"),
                    "aligned_face_path": str(aligned_path.relative_to(CFG.ROOT)).replace(
                        "\\", "/"
                    ),
                    "embedding_path": (
                        str(emb_path.relative_to(CFG.ROOT)).replace("\\", "/")
                        if emb_path is not None
                        else None
                    ),
                    "memo": None,
                }
            )
        log.info("[OK] %s faces=%d", rel, len(faces))

    df = pd.DataFrame(rows)
    CFG.OUTPUT_REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    out_csv = CFG.OUTPUT_REPORTS_DIR / "face_detection_results.csv"
    df.to_csv(out_csv, index=False, encoding="utf-8-sig")
    log.info("saved %s (%d rows)", out_csv, len(df))
    return df
