// cooking station states
export const STATION_STATE = {
    IDLE: "idle",
    HAS_ORDER: "has_order",
    HAS_INGREDIENTS: "has_ingredients",
    IN_STEP: "in_step",
    STEP_COMPLETE: "step_complete",
    COMPLETE: "complete"
};

export const STEP_TYPE = {
    INGREDIENTS: "ingredients",
    COOK: "cook",
    ASSEMBLE: "assemble",
    CHOP: "chop",
    MIX: "mix"
};