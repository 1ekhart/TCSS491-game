/** @import GameEngine from "/js/GameEngine.js" */
import Entity from "/js/AbstractClasses/Entity.js";
import { appendSaveData, getSave } from "/js/GeneralUtils/SaveDataRetrieval.js";
import { CONSTANTS } from "/js/Util.js";

// how many seconds each day will last. Each day is 24 hours, so the hour length will be DAY_LENGTH / 24 and minutes  will be 60/hour length
const DAY_LENGTH = 30; // 200 day length means each minute will be rough 0.14 seconds
const HOUR_LENGTH = DAY_LENGTH / 24;
const MINUTE_LENGTH = HOUR_LENGTH / 60;

// consts for time settings, what is the start and end of each day, etc.
const STARTING_HOUR = 6;
const FINAL_HOUR = 24; // fall asleep at midnight
const MODE_SWITCH_HOUR = 15; // game switches from gathering to cooking at this hour

export default class InGameClock extends Entity {
    constructor() {
        super();
        this.x = 100;
        // this.y = (CONSTANTS.CANVAS_HEIGHT / CONSTANTS.SCALE) - 20
        this.y = 12;
        this.dayTime = HOUR_LENGTH * STARTING_HOUR; // seconds elapsed in the day
        this.dayCount = 1;
        this.load();
        this.halted = false;
    }

    load() { // for when we work with persisting data. Loads the current day, etc.
        const save = getSave();
        if (save) {
            console.log("SaveData:" + save)
            this.dayCount = save.dayCount;
        }
    }

    stopTime() {
        this.halted = true;
    }

    resumeTime() {
        this.halted = false;
    }

    getGameHour() {
        return Math.floor(this.dayTime / HOUR_LENGTH);
    }

    getGameMinute() {
        return Math.floor(this.dayTime % HOUR_LENGTH / MINUTE_LENGTH);
    }

    handleEndOfDay(engine) {
        const save = engine.getSaveObject();
        save.setDay(this.dayCount);
        engine.entities.forEach(function (entitylist) {
            const entityLine = entitylist;
            if (entityLine) {
                entityLine.forEach(function (entity) {
                    if (entity.save) {
                        entity.save(save);
                    }
                })
            }
        });
        save.syncData();

    }


    /**
     * @param {GameEngine} engine
     */
    update(engine) {
        if (!this.halted) {
            this.dayTime += CONSTANTS.TICK_TIME;

            if (this.dayTime >= DAY_LENGTH) { // handle the end of the day
                this.dayTime = HOUR_LENGTH * STARTING_HOUR;
                this.dayCount += 1;
                this.handleEndOfDay(engine)
            }  
        }
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {GameEngine} engine
     */
    draw(ctx, engine) {
        ctx.fillStyle = "#000000";
        ctx.fillText(
            `Day ${this.dayCount} at (${this.getGameHour()} : ${this.getGameMinute()})
            Game Time: ${Math.round(this.dayTime*100) / 100}
            `, this.x, this.y);
    }
}
