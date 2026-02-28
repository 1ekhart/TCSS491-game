/** @import GameEngine from "/js/GameEngine.js" */
/** @import Player from "/js/Player.js" */
import WorldEntity from "/js/AbstractClasses/WorldEntity.js";
import Animator from "/js/GeneralUtils/Animator.js";
import HitBox from "/js/GeneralUtils/Hitbox.js";
import Player from "/js/Player.js";
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
                8, // boar meat
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
const basanAttackCooldown = 2; // attack every 2 seconds
export class Basan extends MovingEntity { // entity that should spawn a hitbox every once in a while
    constructor(engine, x, y) {
        super(engine, x, y);
        this.engine = engine;
        this.width = 40;
        this.height = 48;

        this.distanceThreshold = 200

        this.isRight = false;
        this.movementTimer = 100;
        this.animations = []
        this.animationState = "Idle"
        this.loadAnimation();
        this.moveTimerMax = 200
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

    isClose(engine) {
        const player = engine.getPlayer();
        if (Math.abs(player.x - this.x) < this.distanceThreshold && Math.abs(player.y - this.y) < this.distanceThreshold) {
            return true;
        }
        return false;
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
            if (this.isClose(engine)) { // attack if player close
                const player = engine.getPlayer();
                if (player.x - this.x > 0) { // if player to the right
                    this.isRight = false;
                    engine.addEntity(new FireHitbox(this.x + this.width, this.y - 16, 64, this.height, basanAttackLength, true));
                } else {
                    this.isRight = true;
                    engine.addEntity(new FireHitbox(this.x, this.y - 16, 64, this.height, basanAttackLength, false));
                }
                this.xVelocity = 0;
                this.isStopped = true;
                this.movementTimer = random(basanAttackLength * 1.2 * 60, basanAttackCooldown * 60);
            } else
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

class FireHitbox extends HitBox {
    constructor(x, y, width, height, timer, isFacingRight) {
        super(x, y, width, height, timer)
        this.isFacingRight = isFacingRight;
        this.facingLeftOffset = 0;
        if (!isFacingRight) {
            this.x -= width;
            this.facingLeftOffset = this.width / 2
        }
        this.animation = new Animator(ASSET_MANAGER.getAsset("/Assets/Player/BladeEffect-Sheet.png"), 0, 0, 32, 32, 7, this.timer / 4, 0, false, false);
    }

    update(engine) {
        this.decrementTimer();
        if (this.timer <= 0) {
            this.removeFromWorld = true;
        }

        for(const entity of engine.entities[4]) {
            if (entity instanceof Player && this.isCollidingWith(entity)) {
                entity.reduceHealth(20);
            }
        }
    }

    draw(ctx, engine) {
        // this.animation.drawFrame(CONSTANTS.TICK_TIME, ctx,
            // this.x - engine.camera.x - this.facingLeftOffset, this.y - engine.camera.y - 20, !this.isFacingRight, 2);

        // if (CONSTANTS.DEBUG == true) {
            ctx.strokeStyle = "#aa0000";
            ctx.strokeRect(Math.floor(this.x) - engine.camera.x, this.y - engine.camera.y, this.width, this.height);
        // }
    }


}