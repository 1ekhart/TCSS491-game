/** @import GameEngine from "/js/GameEngine.js" */
import WorldEntity from "/js/AbstractClasses/WorldEntity.js";
import Animator from "/js/GeneralUtils/Animator.js";
import DialogueBox from "/js/GeneralUtils/DialogueBox.js";
import HitBox from "./GeneralUtils/BoundingBox.js";
import Inventory from "/js/Inventory.js";
import MovingEntity from "/js/MovingEntity.js";
import { CONSTANTS, decreaseToZero } from "/js/Util.js";

const floor = Math.floor;

const WALKING_SPEED = 6;
const ACCELERATION = 1;
const JUMPING_STRENGTH = -9.5;
const GRAVITY = 0.6;
const ATTACK_COOLDOWN = 0.3;
const MAX_HEALTH = 100;
const InvincibilityDuration = 1.2
const SQUAT_FRAMES = 3;
export default class Player extends WorldEntity {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 48;

        // mapping from item name to # of that item the player has
        this.inventory = new Inventory();
        this.health = MAX_HEALTH;
        this.maxHealth = MAX_HEALTH;

        //stuff for animations
        this.animations = [];
        this.loadAnimations();
        this.animationState = "Idle"
        this.isRight = true;
        this.haltMovement = false;
        this.attackTimer = ATTACK_COOLDOWN;
        this.invincibilityFrame = 0;
        this.attack = null;
        this.squatTimer = 0;
        this.bufferedJump = false;
    }

    save(saveObject) { // saves the inventory list for now
        this.inventory.save(saveObject);
    }

    loadAnimations() {
        this.animations = [];
        this.idle = new Animator(ASSET_MANAGER.getAsset("/Assets/Player/IdleRun-Sheet.png"), 0, 0, 32, 32, 2, 1, 0, false, true);
        this.animations["Idle"] = this.idle;

        this.run = new Animator(ASSET_MANAGER.getAsset("/Assets/Player/IdleRun-Sheet.png"), 0, 32, 32, 32, 6, .25, 0, false, true);
        this.animations["Run"] = this.run;

        this.idleAttack = new Animator(ASSET_MANAGER.getAsset("/Assets/Player/IdleRun-Sheet.png"), 0, 64, 32, 32, 6, .2, 0, false, false);
        this.animations["IdleAttack"] = this.idleAttack;

        this.squat = new Animator(ASSET_MANAGER.getAsset("/Assets/Player/IdleRun-Sheet.png"), 0, 96, 32, 32, 1, 1, 0, false, true);
        this.animations["Squat"] = this.squat;

        this.jump = new Animator(ASSET_MANAGER.getAsset("/Assets/Player/IdleRun-Sheet.png"), 0, 128, 32, 32, 4, .25, 0, false, true);
        this.animations["Jump"] = this.jump;

        this.jumpAttack = new Animator(ASSET_MANAGER.getAsset("/Assets/Player/IdleRun-Sheet.png"), 0, 160, 32, 32, 6, .1, 0, false, false);
        this.animations["AirAttack"] = this.jumpAttack;
    }

    setAnimationState(state) {
        this.animationState = state;
    }

    /** @param {GameEngine} engine */
    update(engine) {
        if (this.health <= 0) {
            this.inventory.money -= this.inventory.money * 0.05 // lose 5% of your money on death;
            this.health = MAX_HEALTH;
            engine.getClock().skipToNextDay();
            engine.addUIEntity(new DialogueBox(engine, "Ouch! You had passed out and a passing fairy brought you back home, but they stole a little money in return!"));
        }
        this.move(engine);
        this.invincibilityFrame -= CONSTANTS.TICK_TIME;
        // harvesting crops, etc.
        if (engine.input.interact) {
            if (engine.entities[3]) {
                for (const entity of engine.entities[3]) {
                if (entity instanceof WorldEntity && this.isCollidingWith(entity)) {
                    if (entity.interact) {
                        entity.interact(this);
                    }
                }
            }
            }
        }

        if (this.haltMovement == false && engine.click && this.attackTimer <= 0) {
            // attempt to use an item first instead of attacking
            if(this.inventory.getEquippedSlot() !== null && this.onGround) {
                this.inventory.useItem(this.inventory.getEquippedSlot(), this, engine)
                // engine.click = null;
                // return;
            }
            this.tryAttack();
        }

        if (this.attack !== null) {
            if (this.attack.removeFromWorld == true) {
                this.attack = null;
            } else {
                this.attack.x = this.isRight? this.x + this.width + 10 : this.x - this.width - 10 - 32;
                this.onGround? this.attack.y = this.y - 10 : this.attack.y = this.y + 10;
            }

        }

        this.attackTimer -= CONSTANTS.TICK_TIME;
    }

    tryAttack() {
        if (engine.click && this.attackTimer <= 0) {
            if (this.onGround) {
                this.setAnimationState("IdleAttack")
            } else {
                this.setAnimationState("AirAttack")
            }
            this.haltMovement = true;
            this.squat = null;
            this.attackTimer = ATTACK_COOLDOWN;
            if (this.onGround) { // spawn it with respect to width and height if facing right
                this.attack = new BladeHitbox(this.isRight? this.x + this.width + 10 : this.x - 10, this.y - 10, 58, 58, ATTACK_COOLDOWN, this.isRight);
                this.attackTimer = ATTACK_COOLDOWN;
            } else {
                this.attack = new AerialBladeHitbox(this.isRight? this.x + this.width + 10: this.x - 10, this.y / this.height, 58, 32, ATTACK_COOLDOWN, this.isRight);
                this.attackTimer = ATTACK_COOLDOWN * 3;
            }
            engine.addEntity(this.attack);
        }
    }

    reduceHealth(amt) {
        if (this.invincibilityFrame > 0) {return;}
        this.invincibilityFrame = InvincibilityDuration;
        this.health -= amt;
        console.log("Health is now " + this.health)
    }

    /** @param {GameEngine} engine */
    move(engine) {
        // movement
        // TODO: adjust acceleration & drag to 'feel' better, these are placeholder values

        if (this.haltMovement == false) {
            if (engine.input.left && this.xVelocity > -WALKING_SPEED) {
                this.xVelocity -= ACCELERATION;
            } else if (engine.input.right && this.xVelocity < WALKING_SPEED) {
                this.xVelocity += ACCELERATION;
            } else {
                this.xVelocity = decreaseToZero(this.xVelocity, ACCELERATION/2.4); // deceleration with no inputs held
            }
            if (this.onGround && engine.input.jump && this.bufferedJump == false) {
                this.bufferedJump = true; // transition into a squat then jump instead of doing it immediately
                this.setAnimationState("Squat")
                this.squatTimer = SQUAT_FRAMES;
                this.haltMovement = true;
                this.squat = true;
            }
        } else {
            this.xVelocity = decreaseToZero(this.xVelocity, ACCELERATION); // deceleration with no inputs held
        }

        this.squatTimer -= 1;

        if (this.squat && this.haltMovement && this.onGround && this.squatTimer < 0) { // handle the transition from squat to jump
            if (this.bufferedJump) {
                this.bufferedJump = false;
                this.yVelocity = JUMPING_STRENGTH;
                this.squat = false;
            }
            this.haltMovement = false;
        }

        if (this.haltMovement == false) {
            if (engine.click && this.inventory.getEquippedSlot() === null) {
                this.tryAttack();
            } else if (engine.input.left) {
                if (this.onGround) this.setAnimationState("Run");
                this.isRight = false;
            } else if (engine.input.right) {
                if (this.onGround) this.setAnimationState("Run");
                this.isRight = true;
            } else if (this.onGround) {
                this.setAnimationState("Idle");
            } 
        }

        // gravity
        if (engine.input.jump && this.yVelocity < 0) {
            this.yVelocity += (GRAVITY / 2);
        } else if (engine.input.down){
            this.yVelocity += (GRAVITY * 1.5);
        } else if (this.attack && !this.onGround && this.yVelocity > 0) { // if attacking and going downwards
            this.yVelocity = 0;
        } else {
            this.yVelocity += GRAVITY;
        }

        const isOnAirBeforeCollision = !this.onGround;

        // collision
        this.moveColliding(engine);

        if (this.onGround && isOnAirBeforeCollision) { // when landing on the ground, handle landing
            this.squatTimer = SQUAT_FRAMES / 2;
            this.setAnimationState("Squat")
            this.attackTimer = 0;
            this.haltMovement = true;
            this.squat = true;
            if (engine.input.jump) {this.bufferedJump = true}
        }
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {GameEngine} engine
     */
    draw(ctx, engine) {
        if (this.haltMovement === true && this.animations[this.animationState].isDone()) {this.goDefaultState();}
        if (this.doNotUpdate) {this.goDefaultState()}
        if (CONSTANTS.DEBUG == true) {
            ctx.strokeStyle = "#aa0000";
            ctx.strokeRect(floor(this.x) - engine.camera.x, this.y - engine.camera.y, this.width, this.height);
        }

        if (!this.onGround) {
            if (this.attack) {
                this.animations[this.animationState].drawFrame(CONSTANTS.TICK_TIME, ctx,
                (this.x - (20)) - engine.camera.x, floor(this.y) - (this.height) + (32) - floor(engine.camera.y),
                !this.isRight, 2)
                return;
            }
            this.jump.drawFramePlain(ctx, 
                (this.x - (20)) - engine.camera.x, floor(this.y) - (this.height) + (32) - floor(engine.camera.y), 
                2, this.getJumpFrame(), !this.isRight);
        } else {
            this.animations[this.animationState].drawFrame(CONSTANTS.TICK_TIME, ctx,
            (this.x - (20)) - engine.camera.x, floor(this.y) - (this.height) + (32) - floor(engine.camera.y),
             !this.isRight, 2)
        }
    }

    getJumpFrame() { // returns the frame of the jump animation according to the y velocity
        if (this.yVelocity <= 0) { // if going up then...
            return Math.abs(this.yVelocity) <= Math.abs(JUMPING_STRENGTH / 2)? 1 : 0; // if the y velocity is very high, then do the launch frame; 
        } else {
            return Math.abs(this.yVelocity) <= Math.abs(JUMPING_STRENGTH * 3/4)? 2 : 3; // if the y velocity is high, then  do the freefall frame;
        }
        return 2;
    }

    goDefaultState() {
        this.haltMovement = false;
        this.animations[this.animationState].resetTimer();
        this.setAnimationState("Idle")
    }
}

class BladeHitbox extends HitBox {
    constructor(x, y, width, height, timer, isFacingRight) {
        super(x, y, width, height, timer)
        this.isFacingRight = isFacingRight;
        this.facingLeftOffset = 0;
        if (!isFacingRight) {
            this.x -= width;
            this.facingLeftOffset = 5
        }
        this.animation = new Animator(ASSET_MANAGER.getAsset("/Assets/Player/BladeEffect-Sheet.png"), 0, 0, 32, 32, 7, this.timer / 4, 0, false, false);
    }

    update(engine) {
        this.decrementTimer();
        if (this.timer <= 0) {
            this.removeFromWorld = true;
        }

        for(const entity of engine.entities[3]) {
            if (entity instanceof MovingEntity && this.isCollidingWith(entity)) {
                entity.onAttack();
                console.log("attack!")
            }
        }
    }

    draw(ctx, engine) {
        this.animation.drawFrame(CONSTANTS.TICK_TIME, ctx,
            this.x - engine.camera.x - this.facingLeftOffset, this.y - engine.camera.y - 5, !this.isFacingRight, 2);

        if (CONSTANTS.DEBUG == true) {
            ctx.strokeStyle = "#aa0000";
            ctx.strokeRect(floor(this.x) - engine.camera.x, this.y - engine.camera.y, this.width, this.height);
        }
    }
}

class AerialBladeHitbox extends BladeHitbox  {
    constructor(x, y, width, height, timer, isFacingRight) {
        super(x, y, width, height, timer, isFacingRight);
        this.animation = new Animator(ASSET_MANAGER.getAsset("/Assets/Player/BladeEffect-Sheet.png"), 0, 32, 32, 32, 7, this.timer / 4, 0, false, false);
    }

    draw(ctx, engine) {
        this.animation.drawFrame(CONSTANTS.TICK_TIME, ctx,
            this.x - engine.camera.x - this.facingLeftOffset, this.y - engine.camera.y - 20, !this.isFacingRight, 2);

        if (CONSTANTS.DEBUG == true) {
            ctx.strokeStyle = "#aa0000";
            for(const entity of engine.entities[3]) {
            if (entity instanceof MovingEntity && this.isCollidingWith(entity)) {
                entity.onAttack();
                ctx.strokeStyle = "#5c8dff";
            }
        }
            ctx.strokeRect(floor(this.x) - engine.camera.x, this.y - engine.camera.y, this.width, this.height);
        }
    }
}
