import { CONSTANTS } from "/js/Util.js";
export default class Animator {
    constructor(spritesheet, xStart, yStart, width, height, frameCount, frameDuration, framePadding, reverse, loop) {
        Object.assign(this, {spritesheet, xStart, yStart, width, height, frameCount, frameDuration, framePadding, reverse, loop});

        this.elapsedTime = 0;
        this.totalTime = frameCount * frameDuration;
    };

    // draws the frame, pass the ctx, deltaTime (just CONSTANTS.TICK_TIME), the position and if it's flipped horizontally
    drawFrame(tick, ctx, x, y, isFlipped) {
        this.elapsedTime += tick;

        if (this.isDone()) {
            if (this.loop) {
                this.elapsedTime -= this.totalTime;
            } else {
                return;
            }
        }

        const frame = this.currentFrame();
        if (this.reverse) frame = this.frameCount - frame - 1;

        if (isFlipped) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(this.spritesheet,
            this.xStart + frame * (this.width + this.framePadding), this.yStart,
            this.width, this.height,
            -x - this.width*CONSTANTS.SCALE, y,
            this.width*CONSTANTS.SCALE, this.height*CONSTANTS.SCALE);
            ctx.restore();
        } else {
            ctx.drawImage(this.spritesheet,
            this.xStart + frame * (this.width + this.framePadding), this.yStart,
            this.width, this.height,
            x, y,
            this.width*CONSTANTS.SCALE, this.height*CONSTANTS.SCALE);
        }
    };

    currentFrame() {
        return Math.floor(this.elapsedTime / this.frameDuration)
    };

    isDone() {
        return (this.elapsedTime >= this.totalTime);
    };

    resetTimer() { // resets the timer for animations that don't loop but can be repeated.
        this.elapsedTime = 0;
    }
}
