import json
from pathlib import Path

from labeling.constants import GT_SCHEMA_VERSION, LABEL_PENDING, VALID_GT_LABELS
from labeling.paths import GROUND_TRUTH_DIR


def gt_path_for_image(image_id: str) -> Path:
    """gallery image_id (e.g. 2/program_drawing_5.png) -> ground_truth json path."""
    rel = Path(image_id)
    stem = rel.stem
    parent = rel.parent
    return GROUND_TRUTH_DIR / parent / f"{stem}.json"


def load_ground_truth(image_id: str) -> dict | None:
    path = gt_path_for_image(image_id)
    if not path.is_file():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def save_ground_truth(data: dict) -> Path:
    image_id = data["image_id"]
    path = gt_path_for_image(image_id)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    return path


def validate_gt_label(label: str | None) -> bool:
    if label is None or label == "":
        return False
    return label in VALID_GT_LABELS


def iter_ground_truth_files() -> list[Path]:
    if not GROUND_TRUTH_DIR.is_dir():
        return []
    return sorted(GROUND_TRUTH_DIR.rglob("*.json"))


def load_all_ground_truths() -> list[dict]:
    items = []
    for path in iter_ground_truth_files():
        items.append(json.loads(path.read_text(encoding="utf-8")))
    return items
