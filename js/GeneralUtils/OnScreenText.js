/** @import GameEngine from "/js/GameEngine.js" */
import Entity from "/js/AbstractClasses/Entity.js";
import { CONSTANTS } from "/js/Util.js";

export default class OnScreenTextSystem extends Entity {
    constructor(parent, x, y, text, isOn) {
        super();
        this.parent = parent;
        this.x = x;
        this.y = y;
        this.text = text;
        this.isOn = isOn;
        this.font = '12px monospace';
    }

    changeFont(font) {
        this.font = font;
    }

    showText(text) {
        if (text) {
            this.text = text;
        }
        this.isOn = true;
    }

    hideText() {
        this.isOn = false;
    }

    changeText(newText) {
        this.text = newText;
    }
    
    update(engine) {
        if (this.parent.removeFromWorld == true) {
            this.removeFromWorld = true;
        }
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {GameEngine} engine
     */
    draw(ctx, engine) {
        if (this.isOn === false) {
            return;
        }
        const width = ctx.measureText(this.text).width;
        ctx.save();
        ctx.fillStyle = "#ffffff"
        ctx.strokeStyle = "rgba(0, 0, 0, 0.63)"
        ctx.font = this.font;
        ctx.strokeText(this.text, this.x - (width/2) - engine.camera.x, this.y - engine.camera.y);
        ctx.fillText(this.text, this.x - (width/2) - engine.camera.x, this.y - engine.camera.y);
        ctx.restore();
    }
}
