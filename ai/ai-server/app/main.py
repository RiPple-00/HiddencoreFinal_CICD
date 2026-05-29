# 테스트용 API
from fastapi import FastAPI
from schemas import ActionRequest

from action.action_pipeline import run_action_pipeline

app = FastAPI()

@app.post("/ai/action")

def analyze_action(request: ActionRequest):

    result = run_action_pipeline(
        person_crop_path=request.person_crop_path,
        taken_at=request.taken_at,
        program_candidates=[
            p.dict() for p in request.program_candidates
        ]
    )

    return result