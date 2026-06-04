"""Match activity aligned faces against patient DB."""

from __future__ import annotations

import json
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd

import schema as S
import settings as CFG
from face.embedder import FaceEmbedder
from face.io_utils import load_image_bgr, setup_logger
from face.patient_db import load_representatives
from face.review_exporter import export_similarity_reports
from face.similarity import decide_match, rank_patients


def match_activity_faces(overwrite: bool = False) -> tuple[pd.DataFrame, dict]:
    log = setup_logger("similarity", CFG.OUTPUT_LOGS_DIR / "similarity.log")

    det_csv = CFG.OUTPUT_REPORTS_DIR / "face_detection_results.csv"
    if not det_csv.is_file():
        raise FileNotFoundError(
            f"{det_csv} 없음. 먼저: python main.py --step detect-faces"
        )

    representatives = load_representatives()
    embedder = FaceEmbedder()
    det_df = pd.read_csv(det_csv)

    rows: list[dict] = []
    for _, row in det_df.iterrows():
        base = {
            "image_id": row["image_id"],
            "original_image_id": row.get("original_image_id", row["image_id"]),
            "global_index": row.get("global_index"),
            "source_image": row["source_image"],
            "program_id": row["program_id"],
            "program_label": row["program_label"],
            "face_index": int(row["face_index"]),
            "aligned_face_path": row.get("aligned_face_path"),
            "det_score": row.get("det_score"),
            "manual_label": None,
            "memo": row.get("memo"),
            "review_flag": False,
        }

        if row.get("status") == S.IDENTITY_NO_FACE:
            rows.append(
                {
                    **base,
                    "predicted_patient": "unknown",
                    "status": S.IDENTITY_NO_FACE,
                    "top1_patient": None,
                    "top1_similarity": None,
                    "top2_patient": None,
                    "top2_similarity": None,
                    "similarity_gap": None,
                }
            )
            continue

        if row.get("status") in (S.IDENTITY_FAILED, "FAILED"):
            rows.append(
                {
                    **base,
                    "predicted_patient": "unknown",
                    "status": S.IDENTITY_FAILED,
                    "top1_patient": None,
                    "top1_similarity": None,
                    "top2_patient": None,
                    "top2_similarity": None,
                    "similarity_gap": None,
                }
            )
            continue

        aligned = row.get("aligned_face_path")
        if not aligned or pd.isna(aligned):
            rows.append(
                {
                    **base,
                    "predicted_patient": "unknown",
                    "status": S.IDENTITY_FAILED,
                    "top1_patient": None,
                    "top1_similarity": None,
                    "top2_patient": None,
                    "top2_similarity": None,
                    "similarity_gap": None,
                }
            )
            continue

        emb_path = row.get("embedding_path")
        try:
            if emb_path is not None and not pd.isna(emb_path):
                emb = np.load(CFG.ROOT / str(emb_path).replace("\\", "/"))
            else:
                path = CFG.ROOT / str(aligned).replace("\\", "/")
                image = load_image_bgr(path)
                emb = embedder.from_aligned_image(image)
        except Exception as e:
            log.warning("embed fail %s: %s", aligned, e)
            rows.append(
                {
                    **base,
                    "predicted_patient": "unknown",
                    "status": S.IDENTITY_FAILED,
                    "top1_patient": None,
                    "top1_similarity": None,
                    "top2_patient": None,
                    "top2_similarity": None,
                    "similarity_gap": None,
                    "memo": str(e),
                }
            )
            continue

        scores = rank_patients(emb, representatives)
        result = decide_match(scores)

        rec = {
            **base,
            "predicted_patient": result.predicted_patient,
            "status": result.status,
            "top1_patient": result.top1_patient,
            "top1_similarity": result.top1_similarity,
            "top2_patient": result.top2_patient,
            "top2_similarity": result.top2_similarity,
            "similarity_gap": result.similarity_gap,
            "review_flag": result.review_flag,
            "patient_similarities": json.dumps(result.patient_similarities, ensure_ascii=False),
        }
        for pid, sc in result.patient_similarities.items():
            rec[f"{pid}_similarity"] = sc
        rows.append(rec)

    df = pd.DataFrame(rows)
    export_similarity_reports(df)

    analysis = _build_analysis_result_json(df, representatives)
    CFG.ANALYSIS_RESULT_PATH.parent.mkdir(parents=True, exist_ok=True)
    CFG.ANALYSIS_RESULT_PATH.write_text(
        json.dumps(analysis, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    face_json = {
        "schema_version": S.SCHEMA_VERSION,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "config": {
            "similarity_threshold": CFG.SIMILARITY_THRESHOLD,
            "similarity_margin": CFG.SIMILARITY_MARGIN,
            "low_confidence_threshold": CFG.LOW_CONFIDENCE_THRESHOLD,
        },
        "faces": df.to_dict(orient="records"),
    }
    CFG.FACE_SIMILARITY_JSON_PATH.write_text(
        json.dumps(face_json, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    log.info("match complete: %d faces", len(df))
    return df, analysis


def _build_analysis_result_json(
    df: pd.DataFrame, representatives: dict
) -> dict:
    """Backward-compatible analysis_result.json grouped by image_id."""
    by_image: dict[str, list] = defaultdict(list)
    for _, row in df.iterrows():
        if row.get("status") == S.IDENTITY_NO_FACE and row.get("face_index") == 0:
            continue
        if row.get("status") in (S.IDENTITY_NO_FACE, S.IDENTITY_FAILED) and pd.isna(
            row.get("top1_similarity")
        ):
            if row.get("status") == S.IDENTITY_NO_FACE:
                continue
        scores = {}
        for pid in representatives:
            col = f"{pid}_similarity"
            if col in row and pd.notna(row[col]):
                scores[pid] = row[col]

        identity_status = row["status"]
        patient_id = (
            row["predicted_patient"]
            if identity_status == S.IDENTITY_MATCHED
            else (row["top1_patient"] if identity_status == S.IDENTITY_UNCERTAIN else None)
        )
        if identity_status in (S.IDENTITY_UNKNOWN, S.IDENTITY_LOW_CONFIDENCE):
            patient_id = None

        by_image[row["image_id"]].append(
            {
                "person_index": int(row["face_index"]),
                "face_index": int(row["face_index"]),
                "patient_id": patient_id,
                "identity_status": identity_status,
                "similarity": row.get("top1_similarity"),
                "patient_scores": scores or None,
                "aligned_face_path": row.get("aligned_face_path"),
                "top2_patient": row.get("top2_patient"),
                "similarity_gap": row.get("similarity_gap"),
                "review_flag": bool(row.get("review_flag")),
            }
        )

    images = []
    image_ids = sorted(by_image.keys()) if by_image else sorted(
        df["image_id"].unique()
    )
    for i, image_id in enumerate(image_ids, start=1):
        persons = by_image.get(image_id, [])
        no_face_only = (
            len(df[(df["image_id"] == image_id) & (df["status"] == S.IDENTITY_NO_FACE)])
            > 0
            and len(persons) == 0
        )
        images.append(
            {
                "output_index": i,
                "image_id": image_id,
                "is_background": no_face_only,
                "person_count": len(persons),
                "persons": persons,
                "output_image": f"output/visualized/gallery_preprocessed/{i}.png",
            }
        )

    return {
        "schema_version": S.SCHEMA_VERSION,
        "pipeline_stage": S.PIPELINE_STAGE,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "config": {
            "similarity_threshold": CFG.SIMILARITY_THRESHOLD,
            "similarity_margin": CFG.SIMILARITY_MARGIN,
            "face_model": CFG.INSIGHTFACE_MODEL,
            "gallery_dir": str(CFG.GALLERY_PREPROCESSED_DIR),
            "patients_db": str(CFG.FACE_DB_REPRESENTATIVES),
        },
        "images": images,
    }
