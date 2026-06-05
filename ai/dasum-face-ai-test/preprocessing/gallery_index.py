"""Gallery numeric naming: folder 1 -> 1..30, folder 2 -> 31.., folder 3 -> 63.."""

from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

import settings as S

IMAGE_EXTENSIONS = S.IMAGE_EXTENSIONS


def natural_sort_key(path: str) -> list:
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r"(\d+)", path)]


def numeric_relpath(program_id: str, global_index: int) -> str:
    return f"{program_id}/{global_index}.png"


def iter_gallery_sources(gallery_root: Path | None = None):
    """
    Yield (program_id, rel_path, src_path, global_index).
    rel_path is current path under gallery_root (sorted).
    """
    gallery_root = gallery_root or S.GALLERY_RAW_DIR
    by_program: dict[str, list[tuple[str, Path]]] = {}

    for path in sorted(gallery_root.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in IMAGE_EXTENSIONS:
            continue
        rel = path.relative_to(gallery_root).as_posix()
        program_id = Path(rel).parts[0]
        by_program.setdefault(program_id, []).append((rel, path))

    global_index = 0
    for program_id in sorted(by_program.keys(), key=lambda x: int(x) if x.isdigit() else x):
        items = sorted(by_program[program_id], key=lambda x: natural_sort_key(x[0]))
        for rel_path, src_path in items:
            global_index += 1
            yield program_id, rel_path, src_path, global_index


def build_gallery_index(gallery_root: Path | None = None) -> list[dict]:
    """Build index from current files on disk (expects numeric names after rename)."""
    entries = []
    for program_id, rel_path, src_path, idx in iter_gallery_sources(gallery_root):
        numeric = numeric_relpath(program_id, idx)
        entries.append(
            {
                "index": idx,
                "program_id": program_id,
                "program_label": S.PROGRAM_ID_TO_LABEL.get(program_id, program_id),
                "gallery_path": numeric,
                "preprocessed_path": numeric,
                "image_id": numeric,
                "legacy_image_id": rel_path if rel_path != numeric else None,
                "gallery_source": str(src_path.relative_to(S.ROOT)).replace("\\", "/"),
            }
        )
    return entries


def sync_legacy_from_ground_truth(entries: list[dict] | None = None) -> list[dict]:
    """Attach legacy_image_id (e.g. 1/origami_1.png) from GT JSON, ordered by natural sort per program."""
    from labeling.gt_io import GROUND_TRUTH_DIR

    if entries is None:
        entries = load_gallery_index().get("entries", [])

    by_program: dict[str, list[str]] = {}
    for path in sorted(GROUND_TRUTH_DIR.rglob("*.json")):
        try:
            gt = json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue
        img = str(gt.get("image_id", "")).replace("\\", "/")
        if not img or "/" not in img:
            continue
        program_id = Path(img).parts[0]
        by_program.setdefault(program_id, []).append(img)

    legacy_by_index: dict[int, str] = {}
    global_index = 0
    for program_id in sorted(by_program.keys(), key=lambda x: int(x) if x.isdigit() else x):
        for legacy in sorted(set(by_program[program_id]), key=natural_sort_key):
            global_index += 1
            legacy_by_index[global_index] = legacy

    for e in entries:
        idx = int(e["index"])
        legacy = legacy_by_index.get(idx)
        if legacy:
            e["legacy_image_id"] = legacy
            e["original_image_id"] = legacy
    return entries


def save_gallery_index(entries: list[dict], path: Path | None = None) -> Path:
    path = path or S.GALLERY_INDEX_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {"schema_version": "1.0.0", "entries": entries}
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return path


def load_gallery_index(path: Path | None = None) -> dict:
    path = path or S.GALLERY_INDEX_PATH
    if not path.is_file():
        return {"entries": []}
    return json.loads(path.read_text(encoding="utf-8"))


def entry_by_index(entries: list[dict] | None = None) -> dict[int, dict]:
    if entries is None:
        entries = load_gallery_index().get("entries", [])
    return {int(e["index"]): e for e in entries}


def image_id_to_index(entries: list[dict] | None = None) -> dict[str, int]:
    if entries is None:
        entries = load_gallery_index().get("entries", [])
    out: dict[str, int] = {}
    for e in entries:
        idx = int(e["index"])
        for key in ("image_id", "preprocessed_path", "gallery_path", "original_image_id", "legacy_image_id"):
            v = e.get(key)
            if v:
                out[str(v).replace("\\", "/")] = idx
    return out


def _rename_tree(
    root: Path,
    entries: list[dict],
    src_key: str,
    dst_key: str,
) -> None:
    staging: list[tuple[Path, Path]] = []
    for e in entries:
        src_rel = e.get(src_key) or e.get("original_image_id")
        dst_rel = e[dst_key]
        if not src_rel or src_rel == dst_rel:
            continue
        src = root / str(src_rel)
        if not src.is_file():
            continue
        dst = root / dst_rel
        if src.resolve() == dst.resolve():
            continue
        staging.append((src, root / f"_renaming_{e['index']}.png"))

    for src, tmp in staging:
        tmp.parent.mkdir(parents=True, exist_ok=True)
        if tmp.exists():
            tmp.unlink()
        shutil.move(str(src), str(tmp))

    for e in entries:
        tmp = root / f"_renaming_{e['index']}.png"
        dst = root / e[dst_key]
        if not tmp.is_file():
            continue
        dst.parent.mkdir(parents=True, exist_ok=True)
        if dst.exists():
            dst.unlink()
        shutil.move(str(tmp), str(dst))


def rename_gallery_raw(gallery_root: Path | None = None) -> list[dict]:
    """Rename data/gallery using mapping from gallery_index (legacy -> numeric)."""
    gallery_root = gallery_root or S.GALLERY_RAW_DIR
    data = load_gallery_index()
    entries = data.get("entries", [])
    if not entries:
        entries = build_gallery_index(gallery_root)
    for e in entries:
        if "gallery_path" not in e:
            e["gallery_path"] = e.get("preprocessed_path") or numeric_relpath(
                e["program_id"], int(e["index"])
            )
    _rename_tree(gallery_root, entries, "original_image_id", "gallery_path")
    refreshed = build_gallery_index(gallery_root)
    sync_legacy_from_ground_truth(refreshed)
    save_gallery_index(refreshed)
    return refreshed


def rename_preprocessed_to_numeric(
    preprocessed_dir: Path | None = None,
    gallery_root: Path | None = None,
) -> list[dict]:
    preprocessed_dir = preprocessed_dir or S.GALLERY_PREPROCESSED_DIR
    data = load_gallery_index()
    entries = data.get("entries", [])
    if not entries:
        entries = build_gallery_index(gallery_root or S.GALLERY_RAW_DIR)
    for e in entries:
        if "preprocessed_path" not in e:
            e["preprocessed_path"] = e.get("gallery_path") or numeric_relpath(
                e["program_id"], int(e["index"])
            )
    _rename_tree(preprocessed_dir, entries, "original_image_id", "preprocessed_path")
    refreshed = build_gallery_index(gallery_root or S.GALLERY_RAW_DIR)
    save_gallery_index(refreshed)
    return refreshed


def migrate_ground_truth_to_numeric() -> int:
    """Update GT JSON image_id and filenames to numeric paths (1/1.png)."""
    from labeling.gt_io import GROUND_TRUTH_DIR

    data = load_gallery_index()
    legacy_to_numeric: dict[str, str] = {}
    for e in data.get("entries", []):
        numeric = e.get("image_id") or e.get("gallery_path")
        for key in ("original_image_id", "legacy_image_id", "preprocessed_path"):
            old = e.get(key)
            if old and numeric and old != numeric:
                legacy_to_numeric[str(old).replace("\\", "/")] = numeric

    count = 0
    for path in sorted(GROUND_TRUTH_DIR.rglob("*.json")):
        gt = json.loads(path.read_text(encoding="utf-8"))
        old_id = gt.get("image_id", "").replace("\\", "/")
        new_id = legacy_to_numeric.get(old_id, old_id)
        if not new_id:
            idx_map = image_id_to_index()
            new_id = old_id
            if old_id in idx_map:
                ent = entry_by_index()[idx_map[old_id]]
                new_id = ent.get("image_id") or ent.get("gallery_path")

        if new_id == old_id and path.stem == Path(new_id).stem:
            continue

        gt["image_id"] = new_id
        new_path = GROUND_TRUTH_DIR / Path(new_id).with_suffix(".json")
        new_path.parent.mkdir(parents=True, exist_ok=True)
        new_path.write_text(json.dumps(gt, ensure_ascii=False, indent=2), encoding="utf-8")
        if new_path.resolve() != path.resolve() and path.is_file():
            path.unlink()
        count += 1
    return count
