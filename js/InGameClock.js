/** @import GameEngine from "/js/GameEngine.js" */
import Entity from "/js/AbstractClasses/Entity.js";
import DialogueBox from "/js/GeneralUtils/DialogueBox.js";
import { getSave } from "/js/GeneralUtils/SaveDataRetrieval.js";
import LevelManager from "/js/Level.js";
import { secondsToTicks } from "/js/Util.js";

// how many ticks each day will last. Each day is 24 hours, so the hour length will be DAY_LENGTH / 24 and minutes  will be HOUR_LENGTH / 60
const DAY_LENGTH = secondsToTicks(180); // 200 day length means each minute will be rough 0.14 seconds
const HOUR_LENGTH = DAY_LENGTH / 24;
const MINUTE_LENGTH = HOUR_LENGTH / 60;

// consts for time settings, what is the start and end of each day, etc.
const STARTING_HOUR = 6;
// const FINAL_HOUR = 24; // fall asleep at midnight
const MODE_SWITCH_HOUR = 14; // game switches from gathering to cooking at this hour

export default class InGameClock extends Entity {
    constructor(engine) {
        super();
        this.x = 200;
        this.engine = engine;
        // this.y = (CONSTANTS.CANVAS_HEIGHT / CONSTANTS.SCALE) - 20
        this.y = 12;
        this.dayTimeTicks = HOUR_LENGTH * STARTING_HOUR; // ticks elapsed in the day
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

    stopTime() { // stops time updates and halts all entities that aaren't UI or foreground.
        this.halted = true;
        for (let i = 0; i < 6; i++) {
            const entityLayer = this.engine.entities[i];
            if (!entityLayer) {continue;}

            let entityColumns = entityLayer.length;
            for (let j = 0; j < entityColumns; j++) {
                if (entityLayer[j] instanceof LevelManager) {continue;}
                entityLayer[j].doNotUpdate = true;
            }
        }
    }

    resumeTime() {
        this.halted = false;
        for (let i = 0; i < this.engine.entities.length; i++) {
            const entityLayer = this.engine.entities[i];
            if (!entityLayer) {continue;}

            let entityColumns = entityLayer.length;
            for (let j = 0; j < entityColumns; j++) {
                entityLayer[j].doNotUpdate = false;
            }
        }
    }

    getGameHour() {
        return Math.floor(this.dayTimeTicks / HOUR_LENGTH);
    }

    getGameMinute() {
        return Math.floor(this.dayTimeTicks % HOUR_LENGTH / MINUTE_LENGTH);
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
        //restore player health
        const player = this.engine.getPlayer();
        player.health = player.maxHealth;
        this.engine.getLevel().teleport(3, 30, 15.5);
    }

    skipToCookingMode() {
        this.dayTimeTicks = MODE_SWITCH_HOUR * HOUR_LENGTH;
        this.handleModeSwitch(this.engine);
    }

    skipToNextDay() {
        this.dayTimeTicks = STARTING_HOUR * HOUR_LENGTH;
        this.dayCount += 1;
        this.handleEndOfDay(this.engine)
    }


    /**
     * @param {GameEngine} engine
     */
    update(engine) {
        if (!this.halted) {
            this.dayTimeTicks += 1;

            if (this.dayTimeTicks >= DAY_LENGTH) { // handle the end of the day
                this.dayTimeTicks = HOUR_LENGTH * STARTING_HOUR;
                this.dayCount += 1;
                this.handleEndOfDay(engine)
            } else if (this.dayTimeTicks >= MODE_SWITCH_HOUR * HOUR_LENGTH) { // handle switching to cooking mode
                this.handleModeSwitch(engine);
            } else if (this.dayCount <= 1 && !this.isDisplayingWarning && (this.dayTimeTicks >= (MODE_SWITCH_HOUR - 1) * HOUR_LENGTH)) { // give a warning when close to mode switch
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
        engine.getLevel().teleport(3, 40, 15.5);
    }


    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {GameEngine} engine
     */
    draw(ctx, engine) {
        ctx.fillStyle = "#000000";
        ctx.fillText(
            `Day ${this.dayCount} at (${this.getGameHour()} : ${this.getGameMinute()}) Game Time: ${this.dayTimeTicks}`,
            this.x, this.y
        );
    }
}
