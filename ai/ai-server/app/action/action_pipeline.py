# 전체적인 흐름
from action.action_classifier import classify_action
from matching.program_matcher import match_program

def run_action_pipeline(
    person_crop_path,
    taken_at,
    program_candidates
):

    action_result = classify_action(person_crop_path)

    matched_program = match_program(
        taken_at=taken_at,
        action=action_result["action"],
        program_candidates=program_candidates
    )

    return {
        "action": action_result["action"],
        "confidence": action_result["confidence"],
        "matched_program": matched_program
    }