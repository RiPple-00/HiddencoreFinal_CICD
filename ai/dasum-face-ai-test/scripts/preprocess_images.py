"""
공통 전처리: patients / gallery → *_preprocessed

Usage (프로젝트 루트):
  python scripts/preprocess_images.py
  python scripts/preprocess_images.py --target gallery
  python scripts/preprocess_images.py --overwrite
"""

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from preprocessing import config as C
from preprocessing.runner import preprocess_tree


def main() -> None:
    parser = argparse.ArgumentParser(description="공통 전처리 (1회)")
    parser.add_argument(
        "--target", choices=["all", "gallery", "patients"], default="all"
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="기존 *_preprocessed 삭제 후 재생성",
    )
    args = parser.parse_args()
    total = 0

    if args.target in ("all", "gallery"):
        print("[시작] gallery 공통 전처리")
        n = preprocess_tree(C.GALLERY_RAW_DIR, C.GALLERY_PREPROCESSED_DIR, args.overwrite)
        print(f"[완료] gallery: {n}장")
        total += n

    if args.target in ("all", "patients"):
        print("[시작] patients 공통 전처리")
        n = preprocess_tree(
            C.PATIENTS_RAW_DIR, C.PATIENTS_PREPROCESSED_DIR, args.overwrite
        )
        print(f"[완료] patients: {n}장")
        total += n

    print(f"\n[총 {total}장] 다음: python main.py --step build-patient-db")


if __name__ == "__main__":
    main()
