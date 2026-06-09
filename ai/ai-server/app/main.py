from fastapi import FastAPI

from app.action.action_classifier import classify_action
from app.matching.program_matcher import match_program
from app.schemas import ActionRequest, ActionResponse

app = FastAPI(title="HiddenCore AI Server")


@app.post("/ai/action", response_model=ActionResponse)
def action_api(request: ActionRequest) -> ActionResponse:
    result = classify_action(
        image_path=request.image_path,
        image_base64=request.image_base64,
    )

    matched_program = match_program(
        taken_at=request.taken_at,
        action=result["action"],
        program_candidates=request.program_candidates,
    )

    return ActionResponse(
        action=result["action"],
        action_ko=result["action_ko"],
        confidence=result["confidence"],
        matched_program=matched_program,
    )
