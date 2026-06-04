"""Build data_cls from flat data/, train YOLO classify, validate, save model."""
import sys
from pathlib import Path

from ultralytics import YOLO
import shutil

_SCRIPT_DIR = Path(__file__).resolve().parent
if str(_SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPT_DIR))

from prepare_data_images import main as prepare_data_cls

ROOT = Path(__file__).resolve().parents[1]
DST = ROOT / "data_cls"
EPOCHS = 30


def train_and_evaluate():
    weights_dir = ROOT / "runs" / "classify" / "program_action_cls" / "weights"
    model = YOLO(str(ROOT / "yolov8n-cls.pt"))
    model.train(
        data=str(DST),
        epochs=EPOCHS,
        imgsz=224,
        batch=8,
        name="program_action_cls",
        project=str(ROOT / "runs" / "classify"),
        exist_ok=True,
    )

    best = weights_dir / "best.pt"
    if not best.is_file():
        raise FileNotFoundError(f"Training finished but weights not found: {best}")

    out = ROOT / "models" / "action_model.pt"
    out.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(best, out)
    print("Saved model:", out.resolve())

    print("\n=== Validation (val split) ===")
    val_model = YOLO(str(best))
    metrics = val_model.val(data=str(DST), split="val")
    top1 = float(getattr(metrics, "top1", 0) or 0)
    top5 = float(getattr(metrics, "top5", 0) or 0)
    print(f"top1_acc: {top1:.4f}")
    print(f"top5_acc: {top5:.4f}")

    print("\n=== Sample predictions ===")
    val_root = DST / "val"
    for cls_dir in sorted(val_root.iterdir()):
        if not cls_dir.is_dir():
            continue
        sample = next(cls_dir.glob("*.png"), None)
        if sample is None:
            continue
        result = val_model(str(sample), verbose=False)
        pred = result[0].names[int(result[0].probs.top1)]
        conf = float(result[0].probs.top1conf)
        ok = pred == cls_dir.name
        mark = "OK" if ok else "MISS"
        print(f"  [{mark}] {sample.name}: true={cls_dir.name} pred={pred} conf={conf:.3f}")

    if top1 >= 0.5:
        print("\n[SUCCESS] Training and validation completed.")
    else:
        print("\n[WARN] Validation accuracy is low.")

    return top1, top5


if __name__ == "__main__":
    print("=== Step 1: Cleanup + build data_cls from 1.png / 1-1.png ===")
    prepare_data_cls()
    print("\n=== Step 2: Train & evaluate ===")
    train_and_evaluate()
