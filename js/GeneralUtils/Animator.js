import { CONSTANTS } from "/js/Util.js";
export default class Animator {
    /**
     * @param {integer} frameCount the number of frames in this animation
     * @param {number} frameDuration the duration in seconds that this animation will play for
     * @param {boolean} loop
     */
    constructor(spritesheet, xStart, yStart, width, height, frameCount, frameDuration, framePadding, reverse, loop) {
        Object.assign(this, {spritesheet, xStart, yStart, width, height, framePadding, reverse});

        this.elapsedTime = 0;

        this.frameCount = frameCount;
        this.frameDuration = frameDuration;
        this.totalTime = frameCount * frameDuration;

        this.loop = loop;
    };

    // draws the frame, pass the ctx, deltaTime (3rd parameter of draw()), the position and if it's flipped horizontally
    drawFrame(deltaTime, ctx, x, y, isFlipped, scale) {
        this.elapsedTime += deltaTime;

        const theScale = scale;
        if (!scale) {
            theScale = CONSTANTS.SCALE;
        }

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
            -x - this.width*theScale, y,
            this.width*theScale, this.height*theScale);
            ctx.restore();
        } else {
            ctx.drawImage(this.spritesheet,
            this.xStart + frame * (this.width + this.framePadding), this.yStart,
            this.width, this.height,
            x, y,
            Math.floor(this.width*theScale), Math.floor(this.height * theScale));
        }
    };

    drawFramePlain(ctx, x, y, scale, frame, isFlipped) {
        let theScale;
        if (!scale) {
            theScale = CONSTANTS.SCALE;
        } else {
            theScale = scale;
        }
        let theFrame;
        if (!frame) {
            theFrame = 0;
        } else {
            theFrame = frame;
        }
        if (isFlipped) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(this.spritesheet,
                this.xStart + theFrame * (this.width + this.framePadding), this.yStart,
                this.width, this.height,
                -x - this.width * scale, y,
                this.width*theScale, this.height * theScale);
            ctx.restore();
        } else {
            ctx.drawImage(this.spritesheet,
                this.xStart + theFrame * (this.width + this.framePadding), this.yStart,
                this.width, this.height,
                x, y,
                this.width*theScale, this.height * theScale);
        }
    }

    currentFrame() {
        return Math.min(Math.floor(this.elapsedTime / this.frameDuration), this.frameCount)
    }

    isDone() {
        return (this.elapsedTime >= this.totalTime);
    };

    resetTimer() { // resets the timer for animations that don't loop but can be repeated.
        this.elapsedTime = 0;
    }
}
