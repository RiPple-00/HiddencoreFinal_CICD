"""Detect faces in gallery_preprocessed activity images."""

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from face.activity import detect_activity_faces


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()
    df = detect_activity_faces(overwrite=args.overwrite)
    print(f"[완료] {len(df)} rows → output/reports/face_detection_results.csv")


if __name__ == "__main__":
    main()
