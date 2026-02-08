import { CONSTANTS } from "/js/Util.js";

export default class Button {
    constructor(x, y, width, height, callbackFunction, text, color, textColor, strokeColor) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.callbackFunction = callbackFunction;
        this.hovered = false;

        // initialize contents
        this.color = color;
        if (!color) {
            this.color = "#e6e6e6"
        }
        this.text = text;
        if (!text) {
            this.text = "Button"
        }
        this.textColor = textColor;
        if (!textColor) {
            this.textColor = "#0a0a0a";
        }

        this.strokeColor = strokeColor;
        if (!strokeColor) {
            this.strokeColor = "#0a0a0a8c";
        }
    }

    update(engine) {
        if (engine.mouse) {
            const x = engine.mouse.x / CONSTANTS.SCALE;
            const y = engine.mouse.y / CONSTANTS.SCALE;
            if (x >= this.x && x <= this.x + this.width &&
                y >= this.y && y <= this.y + this.height) {
                    if (!this.hovered) {
                        this.hovered = true;
                        engine.setMouseSignal(1);
                    }
                    if (engine.click) {
                        this.callbackFunction();
                        engine.setMouseSignal(0);
                        engine.click = null;
                    }

                } else if (this.hovered) {
                    this.hovered = false;
                    engine.setMouseSignal(0);
                }
        }
    }

    draw(ctx, engine) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height)
        
        ctx.strokeStyle = this.strokeColor;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = this.textColor;
        const txtMetrics = ctx.measureText(this.text);
        const width = txtMetrics.width;
        const height = txtMetrics.actualBoundingBoxAscent;
        ctx.fillText(this.text, this.x - (width / 2) + (this.width / 2), this.y + (this.height / 2) + (height / 2))
    }
}