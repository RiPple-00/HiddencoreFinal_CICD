"""Rename gallery_preprocessed to numeric filenames (1/1.png, 2/31.png, ...)."""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from preprocessing.gallery_index import rename_preprocessed_to_numeric


def main() -> None:
    entries = rename_preprocessed_to_numeric()
    print(f"[완료] {len(entries)}장 매핑 -> data/gallery_index.json")
    for e in entries[:3]:
        print(f"  {e['original_image_id']} -> {e['preprocessed_path']}")
    print("  ...")
    if entries:
        print(f"  {entries[-1]['original_image_id']} -> {entries[-1]['preprocessed_path']}")


if __name__ == "__main__":
    main()
