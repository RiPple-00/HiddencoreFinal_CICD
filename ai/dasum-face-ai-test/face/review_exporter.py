"""Export similarity and manual review CSV/Excel reports."""

from __future__ import annotations

from pathlib import Path

import pandas as pd

import schema as S
import settings as CFG


MANUAL_REVIEW_COLUMNS = [
    "image_id",
    "source_image",
    "program_id",
    "program_label",
    "face_index",
    "aligned_face_path",
    "predicted_patient",
    "status",
    "top1_similarity",
    "top2_patient",
    "top2_similarity",
    "similarity_gap",
    "manual_label",
    "is_correct",
    "memo",
]


def _patient_score_columns(df: pd.DataFrame) -> list[str]:
    return [c for c in df.columns if c.startswith("patient_") and c.endswith("_similarity")]


def export_similarity_reports(df: pd.DataFrame) -> dict[str, Path]:
    CFG.OUTPUT_REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    paths: dict[str, Path] = {}

    main_csv = CFG.OUTPUT_REPORTS_DIR / "face_similarity_results.csv"
    df.to_csv(main_csv, index=False, encoding="utf-8-sig")
    paths["face_similarity_results.csv"] = main_csv

    # Status-split CSV
    for status in [
        S.IDENTITY_MATCHED,
        S.IDENTITY_UNCERTAIN,
        S.IDENTITY_UNKNOWN,
        S.IDENTITY_NO_FACE,
        S.IDENTITY_LOW_CONFIDENCE,
        S.IDENTITY_FAILED,
    ]:
        sub = df[df["status"] == status]
        if len(sub) == 0:
            continue
        key = f"status_{status.lower()}.csv"
        p = CFG.OUTPUT_REPORTS_DIR / key
        sub.to_csv(p, index=False, encoding="utf-8-sig")
        paths[key] = p

    uncertain = df[df["status"] == S.IDENTITY_UNCERTAIN]
    unknown = df[df["status"] == S.IDENTITY_UNKNOWN]
    low_conf = df[
        (df["status"] == S.IDENTITY_LOW_CONFIDENCE)
        | (
            (df["top1_similarity"].notna())
            & (df["top1_similarity"] < CFG.LOW_CONFIDENCE_THRESHOLD)
        )
    ]

    for name, sub in [
        ("uncertain_faces.csv", uncertain),
        ("unknown_faces.csv", unknown),
        ("low_confidence_faces.csv", low_conf),
    ]:
        p = CFG.OUTPUT_REPORTS_DIR / name
        sub.to_csv(p, index=False, encoding="utf-8-sig")
        paths[name] = p

    manual = df[df["status"].isin(
        [S.IDENTITY_UNCERTAIN, S.IDENTITY_UNKNOWN, S.IDENTITY_LOW_CONFIDENCE]
    )].copy()
    for col in ("manual_label", "is_correct", "memo"):
        if col not in manual.columns:
            manual[col] = None
    manual = manual.reindex(columns=MANUAL_REVIEW_COLUMNS)
    manual_path = CFG.OUTPUT_REPORTS_DIR / "manual_review_template.csv"
    manual.to_csv(manual_path, index=False, encoding="utf-8-sig")
    paths["manual_review_template.csv"] = manual_path

    # Excel with sheets
    xlsx_path = CFG.OUTPUT_REPORTS_DIR / "face_similarity_results.xlsx"
    with pd.ExcelWriter(xlsx_path, engine="openpyxl") as writer:
        df.to_excel(writer, sheet_name="all", index=False)
        for sheet, sub in [
            ("matched", df[df["status"] == S.IDENTITY_MATCHED]),
            ("uncertain", uncertain),
            ("unknown", unknown),
            ("no_face", df[df["status"] == S.IDENTITY_NO_FACE]),
            ("low_confidence", low_conf),
        ]:
            if len(sub) > 0:
                sub.to_excel(writer, sheet_name=sheet[:31], index=False)
        manual.to_excel(writer, sheet_name="manual_review", index=False)
    paths["face_similarity_results.xlsx"] = xlsx_path

    review_xlsx = CFG.OUTPUT_REPORTS_DIR / "manual_review_template.xlsx"
    manual.to_excel(review_xlsx, index=False)
    paths["manual_review_template.xlsx"] = review_xlsx

    from face.excel_reports import export_all_excel_reports

    for name, p in export_all_excel_reports(df).items():
        paths[name] = p

    return paths


def rows_to_dataframe(rows: list[dict]) -> pd.DataFrame:
    if not rows:
        return pd.DataFrame()
    return pd.DataFrame(rows)
