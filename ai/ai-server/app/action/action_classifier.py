"""행동 분류 서비스 (YOLO classify)."""

from __future__ import annotations

import base64
import logging
import tempfile
from pathlib import Path
from typing import Any, Union

from ultralytics import YOLO

logger = logging.getLogger(__name__)

# ai-server 루트 (cwd와 무관하게 models/ 경로 고정)
_AI_SERVER_ROOT = Path(__file__).resolve().parent.parent.parent
DEFAULT_MODEL_PATH = _AI_SERVER_ROOT / "models" / "action_model.pt"

ACTION_KO: dict[str, str] = {
    "drawing": "그림그리기",
    "folding": "종이접기",
    "dancing": "춤추기",
}

_model: YOLO | None = None
_loaded_weights: Path | None = None


def get_model(model_path: Path | str | None = None) -> YOLO:
    """학습된 가중치를 한 번만 로드해 재사용합니다."""
    global _model, _loaded_weights

    weights = Path(model_path) if model_path else DEFAULT_MODEL_PATH
    weights = weights.resolve()

    if _model is not None and _loaded_weights == weights:
        return _model

    if not weights.is_file():
        raise FileNotFoundError(
            f"행동 분류 모델을 찾을 수 없습니다: {weights}\n"
            "notebooks/action_training_test.ipynb 또는 scripts/run_action_training.py 로 학습하세요."
        )

    logger.info("Loading action classifier: %s", weights)
    _model = YOLO(str(weights))
    _loaded_weights = weights
    return _model


def _resolve_image_path(image_path: Union[str, Path]) -> Path:
    path = Path(image_path)
    if not path.is_file():
        raise FileNotFoundError(f"이미지 파일을 찾을 수 없습니다: {path}")
    return path.resolve()


def _materialize_image(*, image_path: str | None, image_base64: str | None) -> tuple[Path, tempfile._TemporaryFileWrapper | None]:
    if image_base64:
        raw = base64.b64decode(image_base64, validate=False)
        tmp = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
        tmp.write(raw)
        tmp.flush()
        tmp.close()
        return Path(tmp.name), tmp
    if image_path:
        return _resolve_image_path(image_path), None
    raise ValueError("image_path 또는 image_base64 가 필요합니다.")


def _probabilities_from_result(result) -> list[dict[str, Any]]:
    probs = result.probs.data.cpu().numpy()
    items: list[dict[str, Any]] = []
    for class_id, prob in enumerate(probs):
        action = result.names[class_id]
        items.append(
            {
                "action": action,
                "action_ko": ACTION_KO.get(action, action),
                "confidence": round(float(prob), 4),
            }
        )
    items.sort(key=lambda x: x["confidence"], reverse=True)
    return items


def classify_action(
    image_path: Union[str, Path, None] = None,
    *,
    image_base64: str | None = None,
    model_path: Path | str | None = None,
) -> dict[str, Any]:
    """
    크롭된 인물 이미지로 행동(drawing / folding / dancing)을 분류합니다.

    Returns:
        action: 예측 클래스 (영문)
        action_ko: 예측 클래스 (한글)
        confidence: 1위 클래스 확률 (0~1)
        probabilities: 클래스별 확률 목록 (내림차순)
    """
    path, tmp = _materialize_image(
        image_path=str(image_path) if image_path else None, image_base64=image_base64
    )
    try:
        model = get_model(model_path)
        results = model(str(path), verbose=False)
        if not results:
            raise RuntimeError("모델이 예측 결과를 반환하지 않았습니다.")

        r = results[0]
        if r.probs is None:
            raise RuntimeError("분류 모델이 아닌 가중치이거나 probs가 없습니다.")

        class_id = int(r.probs.top1)
        confidence = float(r.probs.top1conf)
        action = r.names[class_id]

        return {
            "action": action,
            "action_ko": ACTION_KO.get(action, action),
            "confidence": round(confidence, 4),
            "probabilities": _probabilities_from_result(r),
        }
    finally:
        if tmp is not None:
            try:
                Path(tmp.name).unlink(missing_ok=True)
            except OSError:
                pass
