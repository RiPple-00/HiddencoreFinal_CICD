from datetime import datetime
from typing import Union


def parse_datetime(value: Union[str, datetime]) -> datetime:
    if isinstance(value, datetime):
        return value

    text = str(value).strip()
    for fmt in (
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M",
    ):
        try:
            return datetime.strptime(text, fmt)
        except ValueError:
            continue
    raise ValueError(f"지원하지 않는 날짜 형식입니다: {value}")


def is_time_in_range(
    taken_at: Union[str, datetime],
    start_time: Union[str, datetime],
    end_time: Union[str, datetime],
) -> bool:
    taken = parse_datetime(taken_at)
    start = parse_datetime(start_time)
    end = parse_datetime(end_time)
    return start <= taken <= end
