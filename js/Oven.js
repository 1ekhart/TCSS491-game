/** @import GameEngine from "/js/GameEngine.js" */
import EntityInteractable from './AbstractClasses/EntityInteractable.js';
import OnScreenTextSystem from '/js/GeneralUtils/OnScreenText.js';
import Player from '/js/Player.js';
import Item from '/js/Item.js';
import { randomIntRange, CONSTANTS } from '/js/Util.js';

const idleColor = "#7393B3";
const cookColor = "#36454F";
const doneColor = "#8A9A5B";

export default class Oven extends EntityInteractable {
    constructor(x, y, width, height, engine) {
        super();
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.color = idleColor;
        this.toggleCooldown = 60; // 1 second cooldown
        this.cookingTime = 300; // 5 second cooking time
        this.elapsedCook = 0;
        this.isCooking = false;
        this.elapsedTicks = 0;
        this.engine = engine;

        this.toggleable = true;

        this.toggleState = false;
        this.prompt = new OnScreenTextSystem(this,
            this.x + (width / 2), this.y - (height / 4), "Press E to Oven", false);
        this.timer = new OnScreenTextSystem(this,this.x + (width / 2), this.y - (height / 4), "0:0" + Math.ceil((this.cookingTime - this.elapsedCook.toString(10) / 60), false));
        engine.addEntity(this.prompt);
        engine.addEntity(this.timer);
    }

    /** @param {GameEngine} engine */
    update(engine) {
        if (this.toggleState == false) {
            this.timer.hideText();
            for (const entity of engine.entities) {
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
            this.updateTimer(this.timer);
            if(this.isCooking == false) {
                this.color = doneColor;
            }
        }
        if (this.toggleable == false) {
            this.elapsedTicks += 1;
            if (this.elapsedTicks > this.toggleCooldown) {
                this.toggleable = true;
                this.elapsedTicks = 0;
            }
        }
        if (this.isCooking == true) {
            this.elapsedCook += 1;
            if (this.elapsedCook > this.cookingTime) {
                this.isCooking = false;
                this.elapsedCook = 0;
            }
        }
    }

    /** @param {Player} player */
    interact(player) {
        if (this.toggleable == true && this.isCooking == false) {
            this.toggleable = false;
            if (this.toggleState == true) {
                this.unToggleEntity();
        //when we have active slots we'll *try* and remove the active item. For now the stove is eating whatever is in slot one
            } else if(player.inventory.removeItem(0) == true) {
                this.toggleEntity(player);
                this.isCooking = true;
            }
            else {
                console.log("You can't cook air!");
            }
        }
    }
    
    toggleEntity() {
        this.toggleState = true;
        this.color = cookColor;
        console.log("Toggled!");
    }

    unToggleEntity() {
        this.toggleState = false;
        this.color = idleColor;
        console.log("UnToggled!")
        this.engine.addEntity(new Item(2, this.x + (this.width / 4), this.y - (this.height / 2), randomIntRange(10, -10), -5, 3))
    }

    /** @param {OnScreenTextSystem} timer */
    updateTimer(timer) {
        if (this.isCooking == true) {
        timer.changeText("0:0" + Math.ceil((this.cookingTime - this.elapsedCook).toString(10) / 60 ));
        }
        else {
            console.log("done")
            //do nothing
        }
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {GameEngine} enginea 
     */
    draw(ctx, engine) {
        // draw *something* if a subclass doesn't correctly draw anything
        ctx.fillStyle = this.color;
        ctx.fillRect((this.x - engine.camera.x) + (this.width / 4), this.y + (this.height / 4),
        this.width / 2, this.height / 2);
        if (CONSTANTS.DEBUG == true) {
            ctx.strokeStyle = "#aa0000";
            ctx.strokeRect(Math.floor(this.x - engine.camera.x), Math.floor(this.y), this.width, this.height);
        }
    }
}
