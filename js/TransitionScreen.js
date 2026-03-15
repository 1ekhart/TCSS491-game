import { CONSTANTS } from "/js/Util.js";

// duration constants
const FADE_IN_TICKS = 40; //transparent -> black
const HOLD_TICKS = 70;  // hold black
const FADE_OUT_TICKS = 40;  // black -> transparent

const PHASE = {
    FADE_IN: "FADE_IN",
    HOLD: "HOLD",
    FADE_OUT: "FADE_OUT",
    DONE: "DONE",
};

export default class TransitionScreen {
    constructor(engine, onMidpoint, message = "") {
        this.engine = engine;
        this.onMidpoint = onMidpoint;
        this.message = message;

        this.phase = PHASE.FADE_IN;
        this.tick = 0;
        this.alpha = 0;
        this.firedCallback = false;

        this.removeFromWorld = false;
        this.doNotUpdate = false; // stays false

        engine.getClock().stopTime(); // pause game
    }

    update(engine) {
        this.tick++;

        switch (this.phase) {
            case PHASE.FADE_IN:
                this.alpha = this.tick / FADE_IN_TICKS;
                if (this.tick >= FADE_IN_TICKS) {
                    this.alpha = 1;
                    this.phase = PHASE.HOLD;
                    this.tick = 0;

                    // teleport
                    if (!this.firedCallback) {
                        this.firedCallback = true;
                        try { this.onMidpoint(); } catch(e) { console.error("TransitionScreen callback error:", e); }
                    }
                }
                break;
            case PHASE.HOLD:
                this.alpha = 1;
                if (this.tick >= HOLD_TICKS) {
                    this.phase = PHASE.FADE_OUT;
                    this.tick = 0;

                    // resume
                    engine.getClock().resumeTime();
                }
                break;
            case PHASE.FADE_OUT:
                this.alpha = 1 - (this.tick / FADE_OUT_TICKS);
                if (this.tick >= FADE_OUT_TICKS) {
                    this.alpha = 0;
                    this.phase = PHASE.DONE;
                    this.removeFromWorld = true;
                }
                break;
            default:
                this.removeFromWorld = true;
                break;
        }
    }

    draw(ctx) {
        if (this.phase === PHASE.DONE || this.alpha <= 0) return;
        
        const w = CONSTANTS.CANVAS_WIDTH / CONSTANTS.SCALE;
        const h = CONSTANTS.CANVAS_HEIGHT / CONSTANTS.SCALE;

        // black overlay
        ctx.save();
        ctx.globalAlpha = Math.min(1, Math.max(0, this.alpha));
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, w, h);

        // r
        if (this.message && this.phase === PHASE.HOLD) {
            ctx.globalAlpha = 1;
            ctx.fillStyle = "#ffffff";
            ctx.font = "14px monospace";
            const metrics = ctx.measureText(this.message);
            ctx.fillText(this.message, (w - metrics.width) / 2, h / 2);
        }

        ctx.restore();
    }
}