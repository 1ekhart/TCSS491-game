/** @import GameEngine from "/js/GameEngine.js" */
import WorldEntity from "/js/AbstractClasses/WorldEntity.js";
import Animator from "/js/GeneralUtils/Animator.js";
import Inventory from "/js/Inventory.js";
import { CONSTANTS } from "/js/Util.js";

const floor = Math.floor;

const WALKING_SPEED = 6;

export default class Player extends WorldEntity {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 48;

        this.xVelocity = 0;
        this.yVelocity = 0;
        this.onGround = false;

        // mapping from item name to # of that item the player has
        this.inventory = new Inventory();

        //stuff for animations
        this.animations = [];
        this.loadAnimations();
        this.animationState = "Idle"
        this.isRight = true;
    }

    loadAnimations() {
        this.animations = [];
        this.idle = new Animator(ASSET_MANAGER.getAsset("/Assets/Player/IdleRun-Sheet.png"), 0, 0, 32, 32, 2, 1, 0, false, true);
        this.animations["Idle"] = this.idle;

        this.run = new Animator(ASSET_MANAGER.getAsset("/Assets/Player/IdleRun-Sheet.png"), 0, 32, 32, 32, 6, .3, 0, false, true);
        this.animations["Run"] = this.run;

        this.idleAttack = new Animator(ASSET_MANAGER.getAsset("/Assets/Player/IdleRun-Sheet.png"), 0, 64, 32, 32, 6, .05, 0, false, false);
        this.animations["IdleAttack"] = this.idleAttack;
    }

    setAnimationState(state) {
        this.animationState = state;
    }

    /** @param {GameEngine} engine */
    update(engine) {
        this.move(engine);

        // harvesting crops, etc.
        if (engine.input.interact) {
            for (const entity of engine.entities) {
                if (entity instanceof WorldEntity && this.isCollidingWith(entity)) {
                    entity.interact(this);
                }
            }
        }
    }

    /** @param {GameEngine} engine */
    move(engine) {
        // movement
        // TODO: adjust acceleration & drag to 'feel' better, these are placeholder values
        if (engine.input.left && this.xVelocity > -WALKING_SPEED) {
            this.xVelocity -= 1; // acceleration
        } else if (engine.input.right && this.xVelocity < WALKING_SPEED) {
            this.xVelocity += 1;
        } else if (this.xVelocity > 0) {
            this.xVelocity -= 0.5; // drag
        } else if (this.xVelocity < 0) {
            this.xVelocity += 0.5;
        }
        if (this.onGround && engine.input.jump) {
            this.yVelocity = -11; // jump strength
        }

        if (engine.input.left) {
            this.setAnimationState("Run");
            this.isRight = false;
        } else if (engine.input.right) {
            this.setAnimationState("Run");
            this.isRight = true;
        } else {
            this.setAnimationState("Idle");
        }


        // gravity
        if (engine.input.jump) {
            this.yVelocity += 0.5;
        } else {
            this.yVelocity += 1;
        }

        // collision
        const level = engine.getLevel();

        // attempt to move, reducing velocity until no collision occurs (to touch the wall exactly)
        while (this.xVelocity > 0 && level.checkIfBoxCollides(this.x + this.xVelocity, this.y, this.width, this.height)) {
            this.xVelocity -= 1;
        }
        while (this.xVelocity < 0 && level.checkIfBoxCollides(this.x + this.xVelocity, this.y, this.width, this.height)) {
            this.xVelocity += 1;
        }
        this.x += this.xVelocity;

        this.onGround = false;
        while (this.yVelocity > 0 && level.checkIfBoxCollides(this.x, this.y + this.yVelocity, this.width, this.height)) {
            this.yVelocity -= 1;
            this.onGround = true; // we collided with something while moving down
        }
        while (this.yVelocity < 0 && level.checkIfBoxCollides(this.x, this.y + this.yVelocity, this.width, this.height)) {
            this.yVelocity += 1;
        }
        this.y += this.yVelocity;

        // this.y = 240;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {GameEngine} engine
     */
    draw(ctx, engine) {
        this.animations[this.animationState].drawFrame(CONSTANTS.TICK_TIME, ctx, this.x - 17, floor(this.y) - this.height + 32, !this.isRight)
        if (CONSTANTS.DEBUG == true) {
            ctx.strokeStyle = "#aa0000";
            ctx.strokeRect(floor(this.x), floor(this.y), this.width, this.height);
        }
    }
}
