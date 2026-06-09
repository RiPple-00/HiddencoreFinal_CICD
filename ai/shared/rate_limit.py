"""일일 요청 상한 — OpenAI 월 ~3만원 예산 보호용."""

from __future__ import annotations

import os
import time

from fastapi import HTTPException

_day_key: str | None = None
_count: int = 0


def _daily_max() -> int:
    return max(1, int(os.getenv("DAILY_MAX_REQUESTS", "50")))


def check_daily_limit(service_name: str) -> None:
    global _day_key, _count
    today = time.strftime("%Y-%m-%d")
    if _day_key != today:
        _day_key = today
        _count = 0
    if _count >= _daily_max():
        raise HTTPException(
            status_code=429,
            detail=f"{service_name} 일일 사용 한도({_daily_max()}회)에 도달했습니다. 내일 다시 시도해 주세요.",
        )
    _count += 1
