"""단일 이미지 행동 분류 (백엔드 폴백용). stdout에 JSON 1줄 출력."""
from __future__ import annotations

import json
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from app.action.action_classifier import classify_action  # noqa: E402


def main() -> None:
    if len(sys.argv) < 2:
        print(json.dumps({"error": "image_path required"}, ensure_ascii=False))
        sys.exit(1)
    result = classify_action(sys.argv[1])
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
