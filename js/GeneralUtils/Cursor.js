import Animator from "/js/GeneralUtils/Animator.js";
import { CONSTANTS } from "/js/Util.js";

export default class Cursor {
    constructor() {
        this.mouseSprites = new Animator(ASSET_MANAGER.getAsset("/Assets/Player/Cursor-Sheet.png"), 0, 0, 16, 16, 2, 1, 1, false, false);
        this.spriteNum = 0;
    }

    update(engine) {
        if (engine.mouse) {
            this.x = engine.mouse.x / CONSTANTS.SCALE;
            this.y = engine.mouse.y / CONSTANTS.SCALE;
        }
    }

    setSprite(spriteNumber) { // 0 is default, 1 is pointer
        this.spriteNum = spriteNumber;
    }

    draw(ctx, engine) {
        if (engine.mouse) {
            this.mouseSprites.drawFramePlain(ctx, this.x, this.y, 1, this.spriteNum);
            if (CONSTANTS.DEBUG) {
                ctx.strokeStyle = "#aa0000";
                ctx.strokeRect(this.x, this.y, 16, 16);
            }
        }
    }
}