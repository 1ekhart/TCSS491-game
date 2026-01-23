/** @import GameEngine from "/js/GameEngine.js" */
import Entity from "/js/AbstractClasses/Entity.js";

export default class OnScreenTextSystem extends Entity {
    constructor(parent, x, y, text, isOn) {
        super();
        this.parent = parent;
        this.x = x;
        this.y = y;
        this.text = text;
        this.isOn = isOn;
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

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {GameEngine} engine
     */
    draw(ctx, engine) {
        if (this.isOn === false) {
            return;
        }
        const width = ctx.measureText(this.text).width;
        ctx.fillStyle = "#000000"
        ctx.fillText(this.text, this.x - (width/2), this.y);
    }
}
