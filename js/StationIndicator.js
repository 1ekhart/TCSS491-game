import { STEP_TYPE } from "/js/Constants/cookingStationStates.js";
import Animator from "/js/GeneralUtils/Animator.js";

const BOUNCE_SPEED = 0.05;
const BOUNCE_AMOUNT = 6;

export default class StationIndicator {
    constructor(station, stationMap, engine) {
        this.station = station;
        this.stationMap = stationMap;
        this.engine = engine;
        this.bounceTimer = 0;

        this.sprite = new Animator(ASSET_MANAGER.getAsset("/Assets/Icons/StationArrow.png"), 0, 0, 32, 32, 1, 1, 0, false, false);
    }

    update(engine) {
        this.bounceTimer += BOUNCE_SPEED;
    }

    draw(ctx, engine) {
        const step = this.station.getCurrentStep();
        if (!step) return;

        const targetStation = this.stationMap[step.type];
        if (!targetStation) return;

        const bounceOffset = Math.sin(this.bounceTimer) * BOUNCE_AMOUNT;

        const drawX = targetStation.x + (targetStation.width / 2) - 16 - engine.camera.x;
        const drawY = targetStation.y - 48 + bounceOffset - engine.camera.y;

        this.sprite.drawFramePlain(ctx, drawX, drawY, 1);
    }
}

// helper for station indicator
export function createStationMap(prep, oven, chop, mix) {
    return {
        [STEP_TYPE.INGREDIENTS]: prep,
        [STEP_TYPE.COOK]: oven,
        [STEP_TYPE.CHOP]: chop,
        [STEP_TYPE.MIX]: mix,
        [STEP_TYPE.ASSEMBLE]: prep
    };
}