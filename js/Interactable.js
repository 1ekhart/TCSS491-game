/** @import GameEngine from "/js/GameEngine.js" */
import EntityInteractable from './AbstractClasses/EntityInteractable.js';
import OnScreenTextSystem from '/js/GeneralUtils/OnScreenText.js';
import Player from '/js/Player.js';
import Item from '/js/Item.js';
import { randomIntRange, CONSTANTS } from '/js/Util.js';

export default class Interactable extends EntityInteractable {
    constructor(x, y, width, height, engine) {
        super();
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.color = "#c3ce94";
        this.toggleCooldown = 60; // 1 second cooldown
        this.elapsedTicks = 0;
        this.engine = engine;

        this.toggleable = true;

        this.toggleState = false;
        this.prompt = new OnScreenTextSystem(this,
            this.x + (width / 4), this.y - (height / 4), "Press E to Interact with Objects", false);
        engine.addEntity(this.prompt);
    }

    /** @param {GameEngine} engine */
    update(engine) {
        if (this.toggleState == false) {
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
        }
        if (this.toggleable == false) {
            this.elapsedTicks += 1;
            if (this.elapsedTicks > this.toggleCooldown) {
                this.toggleable = true;
                this.elapsedTicks = 0;
            }
        }
    }

    /** @param {Player} player */
    interact(player) {
        if (this.toggleable == true) {
            this.toggleable = false;
            if (this.toggleState == true) {
                this.unToggleEntity();
            } else {
                this.toggleEntity();
            }
        }
    }

    toggleEntity() {
        this.toggleState = true;
        this.color = "#7086f1";
        console.log("Toggled!")
        this.engine.addEntity(new Item(1, this.x + (this.width / 4), this.y - (this.height / 2), randomIntRange(10, -10), -5, randomIntRange(5, 1)))
    }

    unToggleEntity() {
        this.toggleState = false;
        this.color = "#c3ce94";
        console.log("UnToggled!")
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {GameEngine} enginea 
     */
    draw(ctx, engine) {
        // draw *something* if a subclass doesn't correctly draw anything
        ctx.fillStyle = this.color;
        ctx.fillRect((this.x - engine.camera.x) + (this.width / 4), (this.y - engine.camera.y) + (this.height / 4),
        this.width / 2, this.height / 2);
        if (CONSTANTS.DEBUG == true) {
            ctx.strokeStyle = "#aa0000";
            ctx.strokeRect(Math.floor(this.x - engine.camera.x), Math.floor(this.y - engine.camera.y), this.width, this.height);
        }
    }
}
