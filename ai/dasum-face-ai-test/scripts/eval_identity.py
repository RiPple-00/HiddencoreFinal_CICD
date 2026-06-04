"""
Ground truth vs face similarity predictions.

Usage:
  python scripts/eval_identity.py
"""

import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

import schema as S
from labeling.constants import VALID_PATIENT_LABELS
from labeling.gt_io import load_all_ground_truths, validate_gt_label
from labeling.paths import (
    ANALYSIS_RESULT_PATH,
    EVAL_REPORT_JSON,
    EVAL_REPORT_XLSX,
    EVAL_SUMMARY_CSV,
    EVAL_WRONG_MATCHES_CSV,
    FACE_SIMILARITY_CSV,
)
from preprocessing.gallery_index import image_id_to_index, load_gallery_index


def is_correct(gt_label: str, pred_status: str, pred_patient: str | None) -> tuple[bool, str]:
    if gt_label in VALID_PATIENT_LABELS:
        if pred_status == S.IDENTITY_MATCHED and pred_patient == gt_label:
            return True, "ok"
        if pred_status == S.IDENTITY_UNCERTAIN and pred_patient == gt_label:
            return True, "ok_uncertain"
        if pred_status == S.IDENTITY_MATCHED and pred_patient != gt_label:
            return False, "wrong_patient"
        if pred_status in (S.IDENTITY_UNKNOWN, S.IDENTITY_LOW_CONFIDENCE):
            return False, "missed_match"
        if pred_status == S.IDENTITY_NO_FACE:
            return False, "false_no_face"
        return False, "other"

    if gt_label == "unknown":
        if pred_status in (S.IDENTITY_UNKNOWN, S.IDENTITY_LOW_CONFIDENCE, S.IDENTITY_UNCERTAIN):
            return True, "ok"
        if pred_status == S.IDENTITY_MATCHED:
            return False, "false_match"
        if pred_status == S.IDENTITY_NO_FACE:
            return False, "false_no_face"
        return False, "other"

    if gt_label == "no_face":
        if pred_status == S.IDENTITY_NO_FACE:
            return True, "ok"
        if pred_status == S.IDENTITY_MATCHED:
            return False, "false_match"
        if pred_status in (S.IDENTITY_UNKNOWN, S.IDENTITY_UNCERTAIN):
            return False, "false_unknown"
        return False, "other"

    return False, "invalid_gt"


def _load_predictions() -> pd.DataFrame:
    if FACE_SIMILARITY_CSV.is_file():
        return pd.read_csv(FACE_SIMILARITY_CSV)
    if not ANALYSIS_RESULT_PATH.is_file():
        raise FileNotFoundError(
            "예측 결과 없음. python main.py --step match 또는 legacy 실행"
        )
    # fallback: flatten analysis_result.json
    data = json.loads(ANALYSIS_RESULT_PATH.read_text(encoding="utf-8"))
    rows = []
    for img in data.get("images", []):
        for p in img.get("persons", []):
            rows.append(
                {
                    "image_id": img["image_id"],
                    "face_index": p.get("face_index", p.get("person_index")),
                    "predicted_patient": p.get("patient_id") or "unknown",
                    "status": p.get("identity_status"),
                    "top1_similarity": p.get("similarity"),
                }
            )
    return pd.DataFrame(rows)


def main() -> None:
    pred_df = _load_predictions()
    pred_df["face_index"] = pred_df["face_index"].astype(int)

    id_map = image_id_to_index()
    pred_lookup = {}
    for _, row in pred_df.iterrows():
        img_id = str(row["image_id"]).replace("\\", "/")
        gt_key = img_id
        if img_id in id_map:
            ent = load_gallery_index()["entries"]
            for e in ent:
                if int(e["index"]) == id_map[img_id]:
                    gt_key = e.get("image_id") or img_id
                    break
        pred_lookup[(gt_key, int(row["face_index"]))] = row

    gts = load_all_ground_truths()
    if not gts:
        print("[ERROR] ground_truth 없음")
        sys.exit(1)

    rows = []
    error_counts = Counter()
    status_counts = Counter()
    labeled_total = 0
    correct_total = 0

    for gt in gts:
        image_id = gt["image_id"]
        for person_gt in gt.get("persons", []):
            label = person_gt.get("patient_id_gt")
            if not validate_gt_label(label):
                continue
            labeled_total += 1
            idx = int(person_gt["person_index"])
            pred = pred_lookup.get((image_id, idx))
            if pred is None:
                ok, reason = False, "missing_prediction"
                pred_status = None
                pred_patient = None
                sim = None
            else:
                pred_status = pred.get("status")
                pred_patient = pred.get("predicted_patient")
                if pred_patient == "unknown":
                    pred_patient = None
                sim = pred.get("top1_similarity")
                ok, reason = is_correct(label, str(pred_status), pred_patient)

            status_counts[pred_status or "MISSING"] += 1
            if ok:
                correct_total += 1
            else:
                error_counts[reason] += 1

            rows.append(
                {
                    "image_id": image_id,
                    "face_index": idx,
                    "patient_id_gt": label,
                    "pred_status": pred_status,
                    "pred_patient_id": pred_patient,
                    "pred_similarity": sim,
                    "correct": ok,
                    "error_type": reason if not ok else None,
                }
            )

    accuracy = correct_total / labeled_total if labeled_total else 0.0
    n_pred = len(pred_df)
    uncertain_rate = (
        len(pred_df[pred_df["status"] == S.IDENTITY_UNCERTAIN]) / n_pred if n_pred else 0
    )
    unknown_rate = (
        len(
            pred_df[
                pred_df["status"].isin(
                    [S.IDENTITY_UNKNOWN, S.IDENTITY_LOW_CONFIDENCE]
                )
            ]
        )
        / n_pred
        if n_pred
        else 0
    )

    summary = {
        "labeled_persons": labeled_total,
        "correct": correct_total,
        "accuracy": round(accuracy, 4),
        "uncertain_rate": round(uncertain_rate, 4),
        "unknown_rate": round(unknown_rate, 4),
        "error_breakdown": dict(error_counts),
        "pred_status_counts": dict(status_counts),
    }

    EVAL_SUMMARY_CSV.parent.mkdir(parents=True, exist_ok=True)
    pd.DataFrame([summary]).to_csv(EVAL_SUMMARY_CSV, index=False, encoding="utf-8-sig")

    wrong = pd.DataFrame([r for r in rows if not r["correct"]])
    wrong.to_csv(EVAL_WRONG_MATCHES_CSV, index=False, encoding="utf-8-sig")

    report = {"summary": summary, "details": rows}
    EVAL_REPORT_JSON.write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    try:
        from openpyxl import Workbook

        wb = Workbook()
        ws = wb.active
        ws.title = "details"
        if rows:
            ws.append(list(rows[0].keys()))
            for r in rows:
                ws.append(list(r.values()))
        wb.save(EVAL_REPORT_XLSX)
    except ImportError:
        pass

    print(f"[완료] 라벨 {labeled_total}명, 정답 {correct_total}, 정확도 {accuracy:.2%}")
    print(f"[UNCERTAIN 비율] {uncertain_rate:.2%}  [UNKNOWN+LOW 비율] {unknown_rate:.2%}")
    print(f"[CSV] {EVAL_SUMMARY_CSV}")
    print(f"[CSV] {EVAL_WRONG_MATCHES_CSV}")


if __name__ == "__main__":
    main()
