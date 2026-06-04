from typing import List, Optional

from pydantic import BaseModel, Field


class ProgramCandidate(BaseModel):
    post_id: int
    title: str
    content: str
    start_time: str = Field(..., examples=["2026-05-31 10:00"])
    end_time: str = Field(..., examples=["2026-05-31 11:00"])


class ActionRequest(BaseModel):
    image_path: str = Field(..., examples=["C:/path/to/crop.png"])
    taken_at: str = Field(..., examples=["2026-05-31 10:30"])
    program_candidates: List[ProgramCandidate] = Field(default_factory=list)


class MatchedProgram(BaseModel):
    post_id: int
    title: str
    content: str


class ActionResponse(BaseModel):
    action: str
    action_ko: str
    confidence: float
    matched_program: Optional[MatchedProgram] = None
