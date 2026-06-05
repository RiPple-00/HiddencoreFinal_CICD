"""Batch common preprocessing (patients + gallery, once)."""

from __future__ import annotations

import shutil
from pathlib import Path

from preprocessing import config as C
from preprocessing.gallery_index import (
    build_gallery_index,
    iter_gallery_sources,
    numeric_relpath,
    save_gallery_index,
)
from preprocessing.transforms import common_preprocess_pipeline, load_image_bgr, save_image_bgr


def iter_images(root: Path):
    for path in sorted(root.rglob("*")):
        if path.is_file() and path.suffix.lower() in C.IMAGE_EXTENSIONS:
            rel = path.relative_to(root).as_posix()
            yield rel, path


def preprocess_image(src_path: Path, dst_path: Path) -> None:
    image = load_image_bgr(str(src_path))
    image = common_preprocess_pipeline(image)
    dst_path.parent.mkdir(parents=True, exist_ok=True)
    save_image_bgr(str(dst_path), image)


def preprocess_tree(src_root: Path, dst_root: Path, overwrite: bool = False) -> int:
    if overwrite and dst_root.exists():
        shutil.rmtree(dst_root)
    dst_root.mkdir(parents=True, exist_ok=True)

    count = 0
    for rel, src in iter_images(src_root):
        dst = dst_root / rel
        preprocess_image(src, dst)
        count += 1
        print(f"[전처리] {rel}")
    return count


def preprocess_gallery_tree(
    src_root: Path | None = None,
    dst_root: Path | None = None,
    overwrite: bool = False,
) -> int:
    """Gallery only: save as {program_id}/{global_index}.png (1..30, 31.., ...)."""
    src_root = src_root or C.GALLERY_RAW_DIR
    dst_root = dst_root or C.GALLERY_PREPROCESSED_DIR

    if overwrite and dst_root.exists():
        shutil.rmtree(dst_root)
    dst_root.mkdir(parents=True, exist_ok=True)

    entries = []
    count = 0
    for program_id, rel_path, src_path, global_index in iter_gallery_sources(src_root):
        rel_out = numeric_relpath(program_id, global_index)
        dst = dst_root / rel_out
        preprocess_image(src_path, dst)
        count += 1
        print(f"[전처리] {rel_path} -> {rel_out}")

    save_gallery_index(build_gallery_index(src_root))
    return count
