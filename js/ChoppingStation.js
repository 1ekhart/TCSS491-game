/** @import GameEngine from "/js/GameEngine.js" */
import EntityInteractable from './AbstractClasses/EntityInteractable.js';
import OnScreenTextSystem from '/js/GeneralUtils/OnScreenText.js';
import Player from '/js/Player.js';
import Item from '/js/Item.js';
import { randomIntRange, CONSTANTS } from '/js/Util.js';
import { STATION_STATE, STEP_TYPE } from '/js/Constants/cookingStationStates.js';

const idleColor = "#fbbf7c";
const chopColor = "#c5785a";
const doneColor = "#593131";

export default class ChoppingStation extends EntityInteractable {
    constructor(x, y, width, height, station, engine) {
        super();
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.station = station;
        this.engine = engine;

        this.color = idleColor;
        this.toggleable = true;
        this.isChopping = false;
        this.choppingTime = 120; // 2 second chop time
        this.elapsedChop = 0;
        this.elapsedTicks = 0;
        this.toggleCooldown = 60; // 1 second cooldown
        this.toggleState = false;

        this.prompt = new OnScreenTextSystem(this, this.x + (width / 2), this.y - (height / 4), "Press E to chop ingredients", false);
        this.timer = new OnScreenTextSystem(this, this.x + (width / 2), this.y - (height / 4), "", false);
        engine.addEntity(this.prompt);
        engine.addEntity(this.timer);
    }

    /** @param {GameEngine} engine */
    update(engine) {
        if (!this.toggleState) {
            this.timer.hideText();
            if (!engine.entities[4]) return;
            for (const entity of engine.entities[4]) {
                if (entity instanceof Player) {
                    if (this.isCollidingWith(entity)) {
                        this.prompt.showText();
                    } else {
                        this.prompt.hideText();
                    }
                }
            }
        } else {
            this.prompt.hideText();
            this.timer.showText();
            //this.updateTimer(this.timer);
            this.timer.changeText("0:" + Math.ceil((this.choppingTime - this.elapsedChop) / 60));
        }
        if (this.toggleable == false) {
            this.elapsedTicks++;
            if (this.elapsedTicks > this.toggleCooldown) {
                this.toggleable = true;
                this.elapsedTicks = 0;
            }
        }
        if (this.isChopping) {
            this.elapsedChop++;
            if (this.elapsedChop > this.choppingTime) {
                this.isChopping = false;
                this.elapsedChop = 0;
                this.toggleState = false;
                this.toggleable = true;
                this.color = doneColor;
                this.station.completeStep();
                console.log("Chopping finished!");
            }
        }

        if (this.station.state === STATION_STATE.IDLE) {
            this.color = idleColor;
        }
    }

    /** @param {Player} player */
    interact(player) {
        if (!this.toggleable) return;
        if (this.station.canHandleStep(STEP_TYPE.CHOP)) {
                this.toggleable = false;
                this.toggleState = true;
                this.isChopping = true;
                this.elapsedChop = 0;
                this.choppingTime = this.station.getCurrentStepDuration(120);
                this.station.beginStep(STEP_TYPE.CHOP);
                this.color = chopColor;
                console.log("Chopping started!");
        }
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {GameEngine} engine
     */
    draw(ctx, engine) {
        ctx.fillStyle = this.color;
        ctx.fillRect((this.x - engine.camera.x) + (this.width / 4), (this.y - engine.camera.y) + (this.height / 4),
        this.width / 2, this.height / 2);
        if (CONSTANTS.DEBUG == true) {
            ctx.strokeStyle = "#aa0000";
            ctx.strokeRect(Math.floor(this.x - engine.camera.x), Math.floor(this.y - engine.camera.y), this.width, this.height);
        }
    }
}
