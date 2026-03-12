import Animator from "/js/GeneralUtils/Animator.js";
import { CONSTANTS } from "/js/Util.js";

const textVerticalOffset = 8;
export default class Cursor {
    constructor(engine) {
        this.spriteNum = 0;
        this.hoverText = "";
        this.hoverTextShown = false;
        this.hoverTextFont = '8px monospace';
    }

    showText(Text) {
        this.hoverTextShown = true;
        this.hoverText = Text;
    }

    hideText() {
        this.hoverTextShown = false;
    }

    draw(ctx, engine) {
        if (engine.mouse) {
            if (this.hoverTextShown) {
                ctx.font = '8px monospace';
                ctx.fillStyle = "rgb(151, 255, 255)"
                ctx.strokeStyle = "rgb(0, 0, 0)"
                ctx.strokeText(this.hoverText, this.x, this.y - textVerticalOffset);
                ctx.fillText(this.hoverText, this.x, this.y - textVerticalOffset);
                ctx.font = "12px monospace";
            }
            if (CONSTANTS.DEBUG) {
                ctx.strokeStyle = "#aa0000";
                ctx.strokeRect(this.x, this.y, 16, 16);
            }
        }
    }
}
