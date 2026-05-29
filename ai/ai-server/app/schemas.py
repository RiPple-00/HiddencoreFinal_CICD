# 입력 / 출력 형식 정리
from pydantic import BaseModel
from typing import List, Optional

class ProgramCandidate(BaseModel):
    post_id: int
    title: str
    content: str
    start_time: str
    end_time: str

class ActionRequest(BaseModel):
    person_crop_path: str
    taken_at: str
    program_candidates: List[ProgramCandidate]