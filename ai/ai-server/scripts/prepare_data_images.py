"""
data/ 루트의 1.png ~ 94.png, 1-1.png ~ 94-1.png 를 그대로 사용해 data_cls 를 만듭니다.
(image1.png 같은 이름으로 바꿔 복사하지 않음)

- 1~30   → folding
- 31~60  → drawing
- 61~94  → dancing
- 원본(n.png)과 전처리(n-1.png)가 모두 있으면 둘 다 학습에 사용
"""
import random
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
DST = ROOT / "data_cls"

CLASS_RANGES = (
    ("folding", 1, 30),
    ("drawing", 31, 60),
    ("dancing", 61, 94),
)

TRAIN_RATIO = 0.8
SEED = 42


def class_for_number(n: int) -> str | None:
    for cls, start, end in CLASS_RANGES:
        if start <= n <= end:
            return cls
    return None


def sources_for_number(n: int) -> list[Path]:
    """원본·전처리 파일을 원본 파일명 그대로 반환."""
    found = []
    for name in (f"{n}.png", f"{n}-1.png"):
        p = DATA / name
        if p.is_file():
            found.append(p)
    return found


def cleanup_legacy_copies():
    """예전 파이프라인이 만든 dancing/drawing/folding 및 image*.png 제거."""
    for name in ("dancing", "drawing", "folding", "walking", "program"):
        folder = DATA / name
        if folder.is_dir():
            shutil.rmtree(folder, ignore_errors=True)
            print(f"  removed folder: data/{name}/")

    removed = 0
    for p in DATA.glob("image*.png"):
        p.unlink(missing_ok=True)
        removed += 1
    if removed:
        print(f"  removed {removed} image*.png under data/")


def build_data_cls():
    random.seed(SEED)

    samples: list[tuple[str, Path]] = []
    for n in range(1, 95):
        cls = class_for_number(n)
        if cls is None:
            continue
        for src in sources_for_number(n):
            samples.append((cls, src))

    if not samples:
        raise FileNotFoundError(
            "No images in data/. Put 1.png, 1-1.png … 94.png, 94-1.png under data/."
        )

    by_class: dict[str, list[Path]] = {}
    for cls, src in samples:
        by_class.setdefault(cls, []).append(src)

    if DST.exists():
        for cache in DST.glob("*.cache"):
            try:
                cache.unlink()
            except OSError:
                pass
        for split in ("train", "val"):
            sp = DST / split
            if sp.exists():
                shutil.rmtree(sp, ignore_errors=True)
    else:
        DST.mkdir(parents=True, exist_ok=True)

    for cls, paths in by_class.items():
        shuffled = paths.copy()
        random.shuffle(shuffled)
        if len(shuffled) == 1:
            train_paths, val_paths = shuffled, shuffled
        else:
            n_val = max(1, int(round(len(shuffled) * (1 - TRAIN_RATIO))))
            n_train = max(1, len(shuffled) - n_val)
            if n_train + n_val > len(shuffled):
                n_val = len(shuffled) - n_train
            train_paths = shuffled[:n_train]
            val_paths = shuffled[n_train:] or [train_paths[-1]]

        for split, split_paths in (("train", train_paths), ("val", val_paths)):
            out_dir = DST / split / cls
            out_dir.mkdir(parents=True, exist_ok=True)
            for src in split_paths:
                shutil.copy2(src, out_dir / src.name)

    return samples, by_class


def main():
    print("Cleanup legacy image1..image94 copies:")
    cleanup_legacy_copies()

    print("\nBuild data_cls from flat 1.png / 1-1.png (original filenames):")
    samples, by_class = build_data_cls()

    print(f"  total samples: {len(samples)}")
    for cls in ("dancing", "drawing", "folding"):
        paths = by_class.get(cls, [])
        if paths:
            names = sorted(p.name for p in paths)
            print(f"  {cls}: {len(paths)} files (e.g. {names[0]}, …)")

    for split in ("train", "val"):
        counts = {}
        split_dir = DST / split
        if split_dir.is_dir():
            for cls_dir in split_dir.iterdir():
                if cls_dir.is_dir():
                    counts[cls_dir.name] = len(list(cls_dir.glob("*.png")))
        print(f"  {split}:", counts)


if __name__ == "__main__":
    main()
