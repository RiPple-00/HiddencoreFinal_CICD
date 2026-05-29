# 이미지 보고 행동 분류
from ultralytics import YOLO

model = YOLO("models/action_model.pt")

def classify_action(image_path):
    results = model(image_path)

    probs = results[0].probs

    class_id = int(probs.top1)
    confidence = float(probs.top1conf)

    action = results[0].names[class_id]

    return {
        "action": action,
        "confidence": round(confidence, 4)
    }