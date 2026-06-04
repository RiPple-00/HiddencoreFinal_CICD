from __future__ import annotations

from typing import Any, Iterable, Optional, Union

from app.matching.time_utils import is_time_in_range

# AI 행동 라벨 → 프로그램 제목/본문 키워드
ACTION_KEYWORDS: dict[str, tuple[str, ...]] = {
    "drawing": ("그림", "미술", "색칠", "드로잉", "drawing"),
    "folding": ("종이", "접기", "오리가미", "folding", "origami"),
    "dancing": ("춤", "댄스", "무용", "dancing", "dance"),
}


def _candidate_text(candidate: Any) -> str:
    if isinstance(candidate, dict):
        title = candidate.get("title", "")
        content = candidate.get("content", "")
    else:
        title = getattr(candidate, "title", "")
        content = getattr(candidate, "content", "")
    return f"{title} {content}".lower()


def _score_action_match(candidate: Any, action: str) -> int:
    keywords = ACTION_KEYWORDS.get(action, ())
    if not keywords:
        return 0

    text = _candidate_text(candidate)
    score = 0
    for keyword in keywords:
        if keyword.lower() in text:
            score += 1
    return score


def _in_time_window(candidate: Any, taken_at: str) -> bool:
    if isinstance(candidate, dict):
        start_time = candidate["start_time"]
        end_time = candidate["end_time"]
    else:
        start_time = candidate.start_time
        end_time = candidate.end_time
    return is_time_in_range(taken_at, start_time, end_time)


def _to_matched_program(candidate: Any) -> dict[str, Any]:
    if isinstance(candidate, dict):
        return {
            "post_id": candidate["post_id"],
            "title": candidate["title"],
            "content": candidate["content"],
        }
    return {
        "post_id": candidate.post_id,
        "title": candidate.title,
        "content": candidate.content,
    }


def match_program(
    *,
    taken_at: str,
    action: str,
    program_candidates: Iterable[Any],
) -> Optional[dict[str, Any]]:
    """
    촬영 시각 + 예측 행동으로 프로그램 후보 중 하나를 고릅니다.

    1) taken_at이 start_time~end_time 안인 후보만 남김
    2) 제목/본문 키워드가 행동과 맞는 후보 중 점수가 가장 높은 항목 선택
    3) 없으면 None
    """
    candidates = list(program_candidates)
    if not candidates:
        return None

    in_range = [c for c in candidates if _in_time_window(c, taken_at)]
    pool = in_range if in_range else candidates

    scored: list[tuple[int, Any]] = []
    for candidate in pool:
        score = _score_action_match(candidate, action)
        if score > 0:
            scored.append((score, candidate))

    if not scored:
        return None

    scored.sort(key=lambda item: item[0], reverse=True)
    return _to_matched_program(scored[0][1])
