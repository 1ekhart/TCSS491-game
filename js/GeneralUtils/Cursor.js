import Animator from "/js/GeneralUtils/Animator.js";
import OnScreenTextSystem from "/js/GeneralUtils/OnScreenText.js";
import { CONSTANTS } from "/js/Util.js";

const textVerticalOffset = 8;
export default class Cursor {
    constructor(engine) {
        this.mouseSprites = new Animator(ASSET_MANAGER.getAsset("/Assets/Player/Cursor-Sheet.png"), 0, 0, 16, 16, 2, 1, 1, false, false);
        this.spriteNum = 0;
        this.hoverText = "";
        this.hoverTextShown = false;
        this.hoverTextFont = '8px monospace';
    }

    update(engine) {
        if (engine.mouse) {
            this.x = engine.mouse.x / CONSTANTS.SCALE;
            this.y = engine.mouse.y / CONSTANTS.SCALE;
        }
    }

    showText(Text) {
        this.hoverTextShown = true;
        this.hoverText = Text;
    }

    hideText() {
        this.hoverTextShown = false;
    }

    setSprite(spriteNumber) { // 0 is default, 1 is pointer
        this.spriteNum = spriteNumber;
    }

    draw(ctx, engine) {
        if (engine.mouse) {
            this.mouseSprites.drawFramePlain(ctx, this.x, this.y, 1, this.spriteNum);
            if (this.hoverTextShown) {
                ctx.save();
                ctx.font = '8px monospace';
                ctx.fillStyle = "rgb(151, 255, 255)"
                ctx.strokeStyle = "rgb(0, 0, 0)"
                ctx.strokeText(this.hoverText, this.x, this.y - textVerticalOffset);
                ctx.fillText(this.hoverText, this.x, this.y - textVerticalOffset);
                ctx.restore();
            }
            if (CONSTANTS.DEBUG) {
                ctx.strokeStyle = "#aa0000";
                ctx.strokeRect(this.x, this.y, 16, 16);
            }
        }
    }
}