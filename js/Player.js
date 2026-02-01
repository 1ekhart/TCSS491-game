/** @import GameEngine from "/js/GameEngine.js" */
import WorldEntity from "/js/AbstractClasses/WorldEntity.js";
import Animator from "/js/GeneralUtils/Animator.js";
import Inventory from "/js/Inventory.js";
import { CONSTANTS, decreaseToZero } from "/js/Util.js";

const floor = Math.floor;

const WALKING_SPEED = 6;
const ACCELERATION = 1;
const JUMPING_STRENGTH = -9.5;
const GRAVITY = 0.75;

export default class Player extends WorldEntity {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 48;

        // mapping from item name to # of that item the player has
        this.inventory = new Inventory();

        //stuff for animations
        this.animations = [];
        this.loadAnimations();
        this.animationState = "Idle"
        this.isRight = true;
        this.haltMovement = false;
    }

    loadAnimations() {
        this.animations = [];
        this.idle = new Animator(ASSET_MANAGER.getAsset("/Assets/Player/IdleRun-Sheet.png"), 0, 0, 32, 32, 2, 1, 0, false, true);
        this.animations["Idle"] = this.idle;

        this.run = new Animator(ASSET_MANAGER.getAsset("/Assets/Player/IdleRun-Sheet.png"), 0, 32, 32, 32, 6, .25, 0, false, true);
        this.animations["Run"] = this.run;

        this.idleAttack = new Animator(ASSET_MANAGER.getAsset("/Assets/Player/IdleRun-Sheet.png"), 0, 64, 32, 32, 6, .1, 0, false, false);
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
            this.xVelocity -= ACCELERATION;
        } else if (engine.input.right && this.xVelocity < WALKING_SPEED) {
            this.xVelocity += ACCELERATION;
        } else {
            this.xVelocity = decreaseToZero(this.xVelocity, GRAVITY / 2); // deceleration with no inputs held
        }
        if (this.onGround && engine.input.jump) {
            this.yVelocity = JUMPING_STRENGTH;
        }

        if (this.haltMovement == false) {
            if (engine.click) {
                console.log("CLICK")
                this.setAnimationState("IdleAttack")
                this.haltMovement = true;
            } else if (engine.input.left) {
                this.setAnimationState("Run");
                this.isRight = false;
            } else if (engine.input.right) {
                this.setAnimationState("Run");
                this.isRight = true;
            } else {
                this.setAnimationState("Idle");
            }
            // gravity
            if (engine.input.jump && this.yVelocity < 0) {
                this.yVelocity += (GRAVITY / 2);
            } else if (engine.input.down){
                this.yVelocity += (GRAVITY * 1.5);
            } else {
                this.yVelocity += GRAVITY;
            }
        } else {
            this.yVelocity += GRAVITY;
        }


        // collision
        this.moveColliding(engine);
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {GameEngine} engine
     */
    draw(ctx, engine) {
        if (this.haltMovement === true && this.animations[this.animationState].isDone()) {this.goDefaultState();}

        this.animations[this.animationState].drawFrame(CONSTANTS.TICK_TIME, ctx,
            (this.x - (18)) - engine.camera.x, floor(this.y) - (this.height) + (32) - floor(engine.camera.y),
             !this.isRight, 2)
        if (CONSTANTS.DEBUG == true) {
            ctx.strokeStyle = "#aa0000";
            ctx.strokeRect(floor(this.x ) - engine.camera.x, this.y - engine.camera.y, this.width, this.height);
        }
    }

    goDefaultState() {
        this.haltMovement = false;
        this.animations[this.animationState].resetTimer();
        this.setAnimationState("Idle")
    }
}
