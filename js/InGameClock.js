/** @import GameEngine from "/js/GameEngine.js" */
import Entity from "/js/AbstractClasses/Entity.js";
import DialogueBox from "/js/GeneralUtils/DialogueBox.js";
import { appendSaveData, getSave } from "/js/GeneralUtils/SaveDataRetrieval.js";
import { compareFloat, CONSTANTS } from "/js/Util.js";

// how many seconds each day will last. Each day is 24 hours, so the hour length will be DAY_LENGTH / 24 and minutes  will be 60/hour length
const DAY_LENGTH = 180; // 200 day length means each minute will be rough 0.14 seconds
const HOUR_LENGTH = DAY_LENGTH / 24;
const MINUTE_LENGTH = HOUR_LENGTH / 60;

// consts for time settings, what is the start and end of each day, etc.
const STARTING_HOUR = 6;
const FINAL_HOUR = 24; // fall asleep at midnight
const MODE_SWITCH_HOUR = 14; // game switches from gathering to cooking at this hour

export default class InGameClock extends Entity {
    constructor(engine) {
        super();
        this.x = 200;
        this.engine = engine;
        // this.y = (CONSTANTS.CANVAS_HEIGHT / CONSTANTS.SCALE) - 20
        this.y = 12;
        this.dayTime = HOUR_LENGTH * STARTING_HOUR; // seconds elapsed in the day
        this.dayCount = 1;
        this.load();
        this.halted = false;
        this.isCookingMode = false;
        this.isDisplayingWarning = false;
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
        this.isCookingMode = false;
        if (this.dayCount == 7 && this.engine.getPlayer().inventory.money < 3000) { // handle the end of the game
            save.money = 0;
            this.engine.getPlayer().inventory.money = 0;
            this.engine.addUIEntity(new DialogueBox(this.engine, "Oh no! Rent was due and the landlord took all the money, you can still play though, or make a new save and try again"))
        } else if (this.dayCount == 7) {
            this.engine.addUIEntity(new DialogueBox(this.engine, "Congrats! You didn't go bankrupt! You can keep playing and try to get as much money as you can!"))
        }
        this.engine.getLevel().teleport(3, 30, 14);
    }

    skipToCookingMode() {
        this.dayTime = MODE_SWITCH_HOUR * HOUR_LENGTH;
        this.handleModeSwitch(this.engine);
    }

    skipToNextDay() {
        this.dayTime = HOUR_LENGTH * STARTING_HOUR;
        this.dayCount += 1;
        this.handleEndOfDay(this.engine)
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
            }  else if (compareFloat(this.dayTime / HOUR_LENGTH, MODE_SWITCH_HOUR, CONSTANTS.TICK_TIME) === 0) { // handle switching to cooking mode
                this.handleModeSwitch(engine);
            } else if (this.dayCount <= 1 && !this.isDisplayingWarning && compareFloat(this.dayTime / HOUR_LENGTH, MODE_SWITCH_HOUR - 1, CONSTANTS.TICK_TIME) === 0) { // give a warning when close to mode switch
                console.log("It's almost time to open up shop! Gather as much ingredients before the time runs out!")
                this.isDisplayingWarning = true;
                engine.addUIEntity(new DialogueBox(engine, "It's almost time to open up shop! Gather as much ingredients before the time runs out!"));
            }
            
        }
    }

    handleModeSwitch(engine) {
        if (this.isCookingMode) { return;}
        // handle saving the entities placed during the outdoor section
        const save = engine.getSaveObject();
        engine.entities.forEach(function (entitylist) { // call the save but don't sync data just yet.
            const entityLine = entitylist;
            if (entityLine) {
                entityLine.forEach(function (entity) {
                    if (entity.save) {
                        entity.save(save);
                    }
                })
            }
        });
        this.isDisplayingWarning = false;
        this.isCookingMode = true;
        engine.getLevel().teleport(3, 40, 14);
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
