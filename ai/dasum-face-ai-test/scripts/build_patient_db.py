"""Build patient face embedding DB from patients_preprocessed."""

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from face.patient_db import build_patient_database


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--overwrite", action="store_true")
    parser.add_argument("--augment", action="store_true")
    args = parser.parse_args()
    reps = build_patient_database(
        overwrite=args.overwrite,
        use_augmentation=args.augment or None,
    )
    print(f"[완료] representatives: {list(reps.keys())}")


if __name__ == "__main__":
    main()
