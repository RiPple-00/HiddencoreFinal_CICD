"""Rename data/gallery to numeric filenames and refresh gallery_index + GT."""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from preprocessing.gallery_index import (
    build_gallery_index,
    migrate_ground_truth_to_numeric,
    rename_gallery_raw,
    save_gallery_index,
    sync_legacy_from_ground_truth,
)


def main() -> None:
    entries = rename_gallery_raw()
    entries = sync_legacy_from_ground_truth(entries)
    save_gallery_index(entries)
    n_gt = migrate_ground_truth_to_numeric()
    print(f"[완료] gallery 원본 {len(entries)}장 숫자 이름으로 변경")
    print(f"[완료] ground_truth {n_gt}건 image_id 갱신")
    print("  예: data/gallery/1/1.png")
    print("  매핑: data/gallery_index.json")


if __name__ == "__main__":
    main()
