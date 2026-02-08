import Button from "/js/AbstractClasses/Button.js";
import Entity from "/js/AbstractClasses/Entity.js";
import { CONSTANTS } from "/js/Util.js";

// simple dialogue box to display a message to a fixed area in the game camera 
// then delete itself when the "Close Dialogue" button is pressed, or just stay in the world until
// the calling class destroys it manually
export default class DialogueBox extends Entity {
    constructor(engine, text, noClose) {
        super();
        this.engine = engine;
        this.x = (CONSTANTS.CANVAS_WIDTH / CONSTANTS.SCALE) / (6) // take up 1/3 of the screen;
        this.y = (CONSTANTS.CANVAS_WIDTH / CONSTANTS.SCALE) / (16) // take up from the top 1/8 to 1/4
        this.width = this.x * (4);
        this.height = this.y * (4);
        this.text = text;

        const that = this;
        // function to destroy object;
        const close = () => {
            that.removeFromWorld = true;
            if (that.closeButton) {
                that.closeButton.removeFromWorld = true;
            }
        }

        if (!noClose == true) {
            console.log("made close")
            this.closeButton = new Button(this.x + this.width - (this.width / (4)), this.y + this.height - (this.height / (4)), 
                (this.width / (4)) - 10, (this.height / (4)) - 5, close, "Close?", "#9093a1c3", "#1a1a1abf", "#9093a18d");
            this.engine.addUIEntity(this.closeButton);
        }


        // make the text wrappable
        const ctx = CONSTANTS.CONTEXT;
        let words = text.split(' ');
        let line = '';
        let lines = [];

        for (let i = 0; i < words.length; i++) {
            let sampleLine = line + words[i] + " ";
            if (ctx.measureText(sampleLine).width > this.width - (this.width / 9)) {
                lines.push(line);
                line = words[i] + ' ';
            } else {
                line = sampleLine;
            }
        }
        lines.push(line);
        this.lines = lines;

        const txtMetrics = ctx.measureText(text)
        this.fontHeight = txtMetrics.actualBoundingBoxAscent;
    }


    draw(ctx, engine) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, (2 * CONSTANTS.SCALE));
        ctx.fillStyle = "#3e71ff67";
        ctx.fill();

        ctx.strokeStyle = "#000000c0"
        ctx.fillStyle = "#ffffffcb"
        ctx.lineWidth = 1 * CONSTANTS.SCALE;
        let textX = this.x + (this.width / 18);
        let textY = this.y + (this.height / 8);
        for (let i = 0; i < this.lines.length; i++) {
            ctx.strokeText(this.lines[i], textX, textY)
            ctx.fillText(this.lines[i], textX, textY);
            textY += this.fontHeight + 5;
        }
        ctx.restore();

    }
}