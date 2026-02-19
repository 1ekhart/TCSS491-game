/** @import GameEngine from "/js/GameEngine.js" */
/** @import Player from "/js/Player.js" */
import WorldEntity from "/js/AbstractClasses/WorldEntity.js";
import Animator from "/js/GeneralUtils/Animator.js";
import Item from "/js/Item.js";
import { CONSTANTS, randomInt } from "/js/Util.js";

function random(min, max) {
    return Math.floor(Math.random() * max) + min;
}

const MOVEMENT_TIMER_MAX = 600; // ticks (10 seconds)
const REGEN_COOLDOWN_DELAY = 300; // 5 seconds before regen starts
const REGEN_COOLDOWN_REGENERATING = 30; // 0.5 seconds between HP increase
const INVINCIBILITY_PERIOD = 0.3;

export default class MovingEntity extends WorldEntity {
    constructor(engine, x, y) {
        super();
        this.engine = engine;
        this.x = x;
        this.y = y;
        this.width = 48;
        this.height = 24;

        this.movementTimer = 120;

        this.maxHealth = 20;
        this.health = this.maxHealth;
        this.regenTimer = REGEN_COOLDOWN_DELAY;
        this.invincibilityFrame = 0;
    }

    /** @param {Player} player */
    onAttack() {
        if (this.invincibilityFrame > 0) {return;}
        this.invincibilityFrame = INVINCIBILITY_PERIOD;
        this.health -= 8;
        this.regenTimer = REGEN_COOLDOWN_DELAY;

        if(this.health <= 0) {
            this.remove()
            this.engine.addEntity(new Item(
                8, // TODO: correct item type
                this.x + 20, this.y,
                0, -4,
                4
            ))
        }
    }

    /** @param {GameEngine} engine */
    update(engine) {
        this.invincibilityFrame -= CONSTANTS.TICK_TIME;
        this.yVelocity = 5;
        // reverse direction when hitting a wall
        const wasMovingRight = this.xVelocity > 0;
        this.moveColliding(engine);
        if (this.xVelocity === 0) {
            this.xVelocity = wasMovingRight ? -2 : 2;
            this.movementTimer = random(120, MOVEMENT_TIMER_MAX);
        }

        // randomly flip directions every once in a while
        if(this.movementTimer <= 0) {
            this.xVelocity = this.xVelocity * -1;
            this.movementTimer = random(30, MOVEMENT_TIMER_MAX);
        }
        this.movementTimer -= 1;

        if(this.health < this.maxHealth) {
            if(this.regenTimer <= 0) {
                this.health += 1;
                this.regenTimer = REGEN_COOLDOWN_REGENERATING;
            }

            this.regenTimer -= 1;
        }
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {GameEngine} engine
     */
    draw(ctx, engine) {
        ctx.fillStyle = "#00ffff";
        ctx.fillRect(this.x - engine.camera.x, this.y - engine.camera.y, this.width, this.height);
        ctx.fillText(`HP: ${this.health}/${this.maxHealth}`, this.x - engine.camera.x, this.y - 14 - engine.camera.y);
    }
}

const GRAVITY = 0.6;
const basanAttackLength = 1; // 1 second attack length
const basanAttackCooldown = 3; // attack every 3 seconds
export class Basan extends MovingEntity { // entity that should spawn a hitbox every once in a while
    constructor(engine, x, y) {
        super(engine, x, y);
        this.engine = engine;
        this.width = 40;
        this.height = 48;

        this.isRight = false;
        this.movementTimer = 100;
        this.animations = []
        this.animationState = "Idle"
        this.loadAnimation();
        this.moveTimerMax = 300
        this.isStopped = false;
    }

    loadAnimation() {
        this.animations = [];
        this.idle = new Animator(ASSET_MANAGER.getAsset("/Assets/Entities/Basan-Sheet.png"), 0, 0, 32, 32, 6, .25, 0, false, true)
        this.animations["Idle"] = this.idle; 
    }

    setAnimationState(state) {
        this.animationState = state;
    }

    


    /** @param {GameEngine} engine */
    update(engine) {
        this.yVelocity = 5;
        this.invincibilityFrame -= CONSTANTS.TICK_TIME;

        // reverse direction when hitting a wall
        const wasMovingRight = this.xVelocity > 0;
        this.moveColliding(engine);
        if (this.xVelocity === 0 && !this.isStopped) {
            this.xVelocity = wasMovingRight ? -2 : 2;
            this.isRight = wasMovingRight;
            this.movementTimer = random(30, this.moveTimerMax);
        }

        // randomly flip directions every once in a while
        if(this.movementTimer <= 0) {
            if (randomInt(2) == 1 && !this.isStopped) { // random chance to stay still
                this.xVelocity = 0;
                this.movementTimer = random(100, this.moveTimerMax);
                this.isStopped = true;
            } else {
                this.isStopped = false;
                this.xVelocity = !this.isRight ? -2 : 2;
                this.isRight = !this.isRight;
                this.movementTimer = random(30, this.moveTimerMax);
            }
            
        }
        this.movementTimer -= 1;

        if(this.health < this.maxHealth) {
            if(this.regenTimer <= 0) {
                this.health += 1;
                this.regenTimer = REGEN_COOLDOWN_REGENERATING;
            }
            this.regenTimer -= 1;
        }

    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {GameEngine} engine
     */
    draw(ctx, engine) {
        this.animations[this.animationState].drawFrame(CONSTANTS.TICK_TIME, ctx,
            this.x - engine.camera.x - 10, this.y - engine.camera.y - 16, !this.isRight, 2
        )
        ctx.fillStyle = "rgb(0, 0, 0)"
        ctx.fillText(`HP: ${this.health}/${this.maxHealth}`, this.x - engine.camera.x - 15, this.y - 14 - engine.camera.y);
        if (CONSTANTS.DEBUG) {
            ctx.strokeStyle = "#00ffff";
            ctx.strokeRect(this.x - engine.camera.x, this.y - engine.camera.y, this.width, this.height);
            
        }
    }
}
