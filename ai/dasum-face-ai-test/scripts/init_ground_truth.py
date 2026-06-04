"""
analysis_result.json 기준으로 ground-truth JSON 뼈대를 생성합니다.

Usage (프로젝트 루트에서):
  python scripts/init_ground_truth.py
  python scripts/init_ground_truth.py --force
"""

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from labeling.constants import GT_SCHEMA_VERSION, LABEL_PENDING
from labeling.gt_io import gt_path_for_image, save_ground_truth
from labeling.paths import ANALYSIS_RESULT_PATH


def build_gt_from_image(img: dict) -> dict:
    persons = []
    for p in img.get("persons", []):
        persons.append(
            {
                "person_index": p["person_index"],
                "person_bbox": p.get("person_bbox"),
                "person_confidence": p.get("person_confidence"),
                "patient_id_gt": None,
                "notes": None,
            }
        )

    return {
        "schema_version": GT_SCHEMA_VERSION,
        "image_id": img["image_id"],
        "is_background": bool(img.get("is_background", False)),
        "label_status": LABEL_PENDING,
        "labeled_at": None,
        "labeled_by": None,
        "notes": None,
        "persons": persons,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--force",
        action="store_true",
        help="기존 ground_truth JSON을 덮어씁니다 (수동 라벨 주의)",
    )
    args = parser.parse_args()

    if not ANALYSIS_RESULT_PATH.is_file():
        print(f"[ERROR] 분석 결과 없음: {ANALYSIS_RESULT_PATH}")
        print("먼저 실행: python main.py")
        sys.exit(1)

    data = json.loads(ANALYSIS_RESULT_PATH.read_text(encoding="utf-8"))
    created = 0
    skipped = 0

    for img in data.get("images", []):
        image_id = img["image_id"]
        out_path = gt_path_for_image(image_id)

        if out_path.exists() and not args.force:
            skipped += 1
            continue

        gt = build_gt_from_image(img)
        save_ground_truth(gt)
        created += 1

    print(f"[완료] 생성/갱신: {created}건, 스킵(기존 파일): {skipped}건")
    print(f"[경로] {ROOT / 'data' / 'labels' / 'ground_truth'}")


if __name__ == "__main__":
    main()
