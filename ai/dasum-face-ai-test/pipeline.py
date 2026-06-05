"""
Pipeline orchestration: delegates to preprocessing/, face/, labeling/.

Recommended flow:
  preprocess → build-patient-db → detect-faces → match → export-review
"""

from __future__ import annotations

import shutil
from pathlib import Path

import settings as S
from face.activity import detect_activity_faces
from face.match import match_activity_faces
from face.patient_db import build_patient_database
from face.review_exporter import export_similarity_reports
from face.visualize import visualize_matches
from preprocessing.runner import preprocess_gallery_tree, preprocess_tree


def run_preprocess(overwrite: bool = False) -> int:
    S.OUTPUT_LOGS_DIR.mkdir(parents=True, exist_ok=True)
    total = 0
    total += preprocess_gallery_tree(overwrite=overwrite)
    total += preprocess_tree(S.PATIENTS_RAW_DIR, S.PATIENTS_PREPROCESSED_DIR, overwrite)
    return total


def run_build_patient_db(overwrite: bool = False, use_augmentation: bool | None = None) -> dict:
    return build_patient_database(overwrite=overwrite, use_augmentation=use_augmentation)


def run_detect_faces(overwrite: bool = False):
    return detect_activity_faces(overwrite=overwrite)


def run_match(overwrite: bool = False):
    if overwrite and S.OUTPUT_REPORTS_DIR.exists():
        for name in (
            "face_similarity_results.csv",
            "face_similarity_results.xlsx",
            "uncertain_faces.csv",
            "unknown_faces.csv",
            "low_confidence_faces.csv",
            "manual_review_template.csv",
            "manual_review_template.xlsx",
        ):
            p = S.OUTPUT_REPORTS_DIR / name
            if p.is_file():
                p.unlink()
    df, analysis = match_activity_faces(overwrite=overwrite)
    visualize_matches(df, overwrite=True)
    return df, analysis


def run_export_review():
    import pandas as pd

    csv_path = S.OUTPUT_REPORTS_DIR / "face_similarity_results.csv"
    if not csv_path.is_file():
        raise FileNotFoundError(f"{csv_path} 없음. 먼저 --step match 실행")
    df = pd.read_csv(csv_path)
    return export_similarity_reports(df)


def run_all(overwrite: bool = False, use_augmentation: bool | None = None):
    run_preprocess(overwrite=overwrite)
    run_build_patient_db(overwrite=overwrite, use_augmentation=use_augmentation)
    run_detect_faces(overwrite=overwrite)
    return run_match(overwrite=overwrite)


def reset_regenerable_outputs(keep_gt: bool = True) -> None:
    """Clear regenerable dirs only (never touches raw patients/gallery/ground_truth)."""
    for path in (
        S.GALLERY_PREPROCESSED_DIR,
        S.PATIENTS_PREPROCESSED_DIR,
        S.ACTIVITY_FACES_DIR,
        S.FACE_DB_DIR,
        S.AUGMENTED_DIR,
        S.OUTPUT_DIR,
    ):
        if path.exists():
            shutil.rmtree(path)
    S.OUTPUT_REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    S.OUTPUT_LOGS_DIR.mkdir(parents=True, exist_ok=True)
    S.OUTPUT_VISUALIZED_DIR.mkdir(parents=True, exist_ok=True)
