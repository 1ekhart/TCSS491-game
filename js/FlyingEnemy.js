/** @import GameEngine from "/js/GameEngine.js" */
import WorldEntity from "/js/AbstractClasses/WorldEntity.js";
import Animator from "/js/GeneralUtils/Animator.js";
import Item from "/js/Item.js";
import Player from "/js/Player.js";
import { CONSTANTS, secondsToTicks, decreaseToZero } from "/js/Util.js";
const min = Math.min, max = Math.max;

const MAX_HEALTH = 30;

const EVADE_DISTANCE = Math.pow(CONSTANTS.TILESIZE * 3, 2) // 3 tiles radius
const ACTIVE_DISTANCE = Math.pow(CONSTANTS.TILESIZE * 11, 2) // 11 tiles radius

// the relative Y range to target the player at
const TARGET_MIN_Y = 70;
const TARGET_MAX_Y = 85;
const TARGET_MIN_X = -80;
const TARGET_MAX_X = 80 + 24; // player width

const REGEN_COOLDOWN_DELAY = secondsToTicks(8); // 8 seconds before regen starts
const REGEN_COOLDOWN_REGENERATING = secondsToTicks(0.5); // 0.5 seconds between HP increase
const INVINCIBILITY_PERIOD = secondsToTicks(0.6);

const frameDurationAnimation = 0.12;

export default class FlyingEnemy extends WorldEntity {
    /** @param {GameEngine} engine */
    constructor(engine, x, y) {
        super();
        this.engine = engine;
        this.x = x - 12;
        this.y = y - 12;
        this.width = 48;
        this.height = 48;
        this.health = MAX_HEALTH;
        this.invincibilityTicks = 0;
        this.regenTimer = 0;

        // idle: before player gets close
        // evading: when player gets too close
        // active: while in combat
        // swooping: flying at the player
        // cooldown: after swooping at the player
        this.state = "idle"; // idle, evading, active, swooping, cooldown
        this.stateTicks = 0; // counts up until state change
        this.animations = [];
        this.animationState = "Flying";
        this.loadAnimations();

        this.facingRight = true; // false = left, true = right
    }

    loadAnimations() {
        this.animations = [];
        this.animations["Flying"] = new Animator(ASSET_MANAGER.getAsset("/Assets/Entities/Dragon-Sheet.png"), 0, 0, 32, 32, 4, frameDurationAnimation, 0, false, true);
        this.animations["Attack"] = new Animator(ASSET_MANAGER.getAsset("/Assets/Entities/Dragon-Sheet.png"), 0, 32, 32, 32, 4, frameDurationAnimation, 0, false, false);
    }

    changeState(state) {
        this.state = state;
        this.stateTicks = 0;
    }

    setAnimationState(state) {
        this.animationState = state;
    }

    /** @param {GameEngine} engine */
    update(engine) {
        const player = engine.getPlayer()

        // avoid the player while idle or active
        // go idle if too far away
        if(this.state === "idle" || this.state === "active") {
            const squaredDistFromPlayer = Math.pow(this.x - player.x, 2) + Math.pow(this.y - player.y, 2);
            if(squaredDistFromPlayer < EVADE_DISTANCE) {
                this.changeState("evading");
                this.setAnimationState("Flying");
                // this.facingRight = this.x > player.x // face away from the player
                this.xVelocity = this.facingRight ? 24 : -24; // move away from the player
            }
            if(squaredDistFromPlayer > ACTIVE_DISTANCE) {
                this.changeState("idle")
                this.setAnimationState("Flying");
                this.xVelocity = 0;
                this.yVelocity = 0;
            }
        }
        // evading: slow down, switch to active after
        if(this.state === "evading") {
            if(this.xVelocity !== 0) {
                this.xVelocity = decreaseToZero(this.xVelocity, 2);
            } else {
                this.changeState("active");
                this.setAnimationState("Flying");
            }
        }
        // active: wait for 2 secs & align w/ player height, then swoop at the player
        if(this.state === "active") {
            // hover above the player's head level
            const dy = player.y - this.y // positive if we're above the player
            if(dy > TARGET_MAX_Y) { // too high above
                this.yVelocity = min(this.yVelocity + 0.5, 6);
            } else if(dy < TARGET_MIN_Y) { // too far below
                this.yVelocity = max(this.yVelocity - 0.25, -3);
            } else { // close enough
                this.yVelocity = decreaseToZero(this.yVelocity, 2);
            }

            // face towards the player
            this.facingRight = this.x < player.x

            // hover close-ish to the player
            const dx = player.x - this.x // positive if we're to the right of the player
            if(dx > TARGET_MAX_X) {
                this.xVelocity = min(this.xVelocity + 0.325, 3);
            } else if(dx < TARGET_MIN_X) {
                this.xVelocity = max(this.xVelocity - 0.325, -3);
            } else {
                this.xVelocity = decreaseToZero(this.xVelocity, 1);
            }

            this.stateTicks += 1;
            // swoop after 2 seconds and we're aligned w/ the player vertically
            if(this.stateTicks > 120 && this.yVelocity === 0) {
                this.xVelocity = this.facingRight ? 3 : -3;
                this.changeState("swooping")
                this.setAnimationState("Attack");
            }
        }
        // swoop down towards the player, then go into cooldown
        if(this.state === "swooping") {
            if(this.stateTicks < 20) {
                this.yVelocity += 0.25;
            } else {
                this.yVelocity += -0.75;
            }

            this.stateTicks += 1;
            if(this.stateTicks > 40) {
                this.changeState("cooldown")
                this.setAnimationState("Flying");
                this.yVelocity = 0;
                this.xVelocity = 0;
            }
        }
        // after swooping, stay still for 2 secs to allow the player to attack, then switch back to active
        if(this.state === "cooldown") {
            if (this.xVelocity != 0) {
                decreaseToZero(this.xVelocity, 5);
            }
            if (this.yVelocity != 0) {
                decreaseToZero(this.yVelocity, 5);
            }
            this.stateTicks += 1;
            if(this.stateTicks > 120) {
                this.changeState("active")
                this.setAnimationState("Flying");
            }
        }

        this.moveColliding(this.engine)

        // TODO: if collided w/ wall & evading, fly up and reverse direction to escape?
        // maybe not necessary, it already flies erratically up & down

        // deal contact damage
        for(const entity of engine.entities[4]) {
            if (entity instanceof Player && this.isCollidingWith(entity)) {
                // if contact and not in a swooping attack, deal less damage
                if (this.state !== "swooping") {
                    entity.reduceHealth(10);
                    this.yVelocity = 0;
                    this.xVelocity = 0;
                    if (this.state !== "cooldown") {
                        this.changeState("cooldown");
                        this.stateTicks = 80;
                    }
                    this.setAnimationState("Attack")
                } else {
                    entity.reduceHealth(20);
                }
            }
        }

        // regenerate health
        if(this.health < MAX_HEALTH) {
            if(this.regenTimer <= 0) {
                this.health += 1;
                this.regenTimer = REGEN_COOLDOWN_REGENERATING;
            }
            this.regenTimer -= 1;
        }
        this.invincibilityTicks -= 1;
    }

    onAttack() {
        if (this.invincibilityTicks > 0) {return;}
        this.invincibilityTicks = INVINCIBILITY_PERIOD;
        this.health -= 8;
        this.regenTimer = REGEN_COOLDOWN_DELAY;

        if(this.health <= 0) {
            this.remove()
            this.engine.addEntity(new Item(
                8, // TODO: different item
                this.x + 20, this.y,
                0, -4,
                6 // 6 of it, it's hard to get
            ))
        }
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {GameEngine} engine
     * @param {number} deltaTime
     */
    draw(ctx, engine, deltaTime) {
        if (this.animationState == "Attack" && this.animations[this.animationState].isDone()) {this.goDefaultState();}
        this.animations[this.animationState].drawFrame(deltaTime, ctx,
            (this.x - 10) - engine.camera.x, this.y - this.height + (35) - engine.camera.y,
            this.facingRight, 2
        )

        //draw health
        ctx.fillStyle = "rgba(56, 1, 1, 0.51)"
        ctx.fillRect(this.x - engine.camera.x, this.y - engine.camera.y - 18, this.width, 3 * CONSTANTS.SCALE);
        ctx.fillStyle = "rgb(228, 78, 95)"
        ctx.fillRect(this.x - engine.camera.x, this.y - engine.camera.y - 18, this.width * (this.health / MAX_HEALTH), 3 * CONSTANTS.SCALE);

        if(CONSTANTS.DEBUG) {
            ctx.fillText(`HP: ${this.health}/${MAX_HEALTH}`, this.x - engine.camera.x, this.y - 14 - engine.camera.y);
            ctx.fillText(this.state, this.x - engine.camera.x, this.y - 32 - engine.camera.y);
            ctx.strokeStyle = this.facingRight ? "#ffcc00" : "#ff8800";
            ctx.strokeRect(this.x - engine.camera.x, this.y - engine.camera.y, this.width, this.height);
        }
    }

    goDefaultState() {
        this.animations["Attack"].resetTimer();
        this.setAnimationState("Flying")
    }
}
