/** @import GameEngine from "/js/GameEngine.js" */
import WorldEntity from "/js/AbstractClasses/WorldEntity.js";
import Animator from "/js/GeneralUtils/Animator.js";
import DialogueBox from "/js/GeneralUtils/DialogueBox.js";
import HitBox from "./GeneralUtils/BoundingBox.js";
import Inventory from "/js/Inventory.js";
import MovingEntity from "/js/MovingEntity.js";
import FlyingEnemy from "/js/FlyingEnemy.js";
import { CONSTANTS, decreaseToZero, secondsToTicks } from "/js/Util.js";
import Customer from "/js/Customer.js";

const floor = Math.floor;

const WALKING_SPEED = 6;
const ACCELERATION = 1;
const JUMPING_STRENGTH = -9.5;
const GRAVITY = 0.6;
const ATTACK_COOLDOWN = secondsToTicks(0.3);
const MAX_HEALTH = 100;
const INVINCIBILITY_DURATION = secondsToTicks(1.2);
const WARNING_DURATION = secondsToTicks(4);
const SQUAT_FRAMES = 3;

export default class Player extends WorldEntity {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 48;

        this.inventory = new Inventory();
        this.health = MAX_HEALTH;
        this.maxHealth = MAX_HEALTH;

        //stuff for animations
        this.animations = [];
        this.loadAnimations();
        this.animationState = "Idle"
        this.isRight = true;
        this.haltMovement = false;
        this.attackCooldown = ATTACK_COOLDOWN;
        this.invincibilityTicks = 0;
        this.attack = null;
        this.squatTimer = 0;
        this.bufferedJump = false;

        this.warningUIx = (CONSTANTS.CANVAS_WIDTH / CONSTANTS.SCALE) / 3;
        this.warningUIWidth = (CONSTANTS.CANVAS_WIDTH / CONSTANTS.SCALE) / 3;
        this.warningUIy = (CONSTANTS.CANVAS_HEIGHT / CONSTANTS.SCALE) / 18;
        this.warningTimer = 0;
        this.warningText = "";
        this.warningLines = [];
    }

    save(saveObject) { // saves the inventory list for now
        this.inventory.save(saveObject);
    }

    loadAnimations() {
        this.animations = [];
        this.animations["Idle"] = new Animator(ASSET_MANAGER.getAsset("/Assets/Player/IdleRun-Sheet.png"), 0, 0, 32, 32, 2, 1, 0, false, true);

        this.animations["Run"] = new Animator(ASSET_MANAGER.getAsset("/Assets/Player/IdleRun-Sheet.png"), 0, 32, 32, 32, 6, .12, 0, false, true);

        this.animations["IdleAttack"] = new Animator(ASSET_MANAGER.getAsset("/Assets/Player/IdleRun-Sheet.png"), 0, 64, 32, 32, 6, .05, 0, false, false);

        this.animations["Squat"] = new Animator(ASSET_MANAGER.getAsset("/Assets/Player/IdleRun-Sheet.png"), 0, 96, 32, 32, 1, 1, 0, false, true);

        this.animations["Jump"] = new Animator(ASSET_MANAGER.getAsset("/Assets/Player/IdleRun-Sheet.png"), 0, 128, 32, 32, 4, .25, 0, false, true);

        this.animations["AirAttack"] = new Animator(ASSET_MANAGER.getAsset("/Assets/Player/IdleRun-Sheet.png"), 0, 160, 32, 32, 6, .05, 0, false, false);
    }

    setAnimationState(state) {
        this.animationState = state;
    }

    /** @param {GameEngine} engine */
    update(engine) {
        if (this.health <= 0) {
            this.inventory.money -= Math.floor(this.inventory.money * 0.05) // lose 5% of your money on death;
            this.health = MAX_HEALTH;
            engine.getClock().skipToNextDay();
            if (engine.getClock().dayCount !== 7) {
                engine.addUIEntity(new DialogueBox(engine, "Ouch! You had passed out and a passing fairy brought you back home, but they stole a little money in return!"));
            }
        }
        this.move(engine);
        this.invincibilityTicks -= 1;
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

        if (engine.input.refuse) { // refuse an order from a customer if pressing F
            if (engine.entities[3]) {
                for (const entity of engine.entities[3]) {
                    if (entity instanceof Customer && this.isCollidingWith(entity)) {
                        if (entity.refuseOrder) {
                            entity.refuseOrder(this);
                        }
                    }
                }
            }
        }

        if (this.haltMovement == false && engine.input.click && this.attackCooldown <= 0) {
            // attempt to use an item first instead of attacking
            if(this.inventory.getEquippedSlot() !== null && this.onGround) {
                this.inventory.useItem(this.inventory.getEquippedSlot(), this, engine)
                // consume click and don't do anything else if an item was attempted to be used
                engine.input.click = false;
                return;
            }
            this.tryAttack();
        }

        if (this.attack !== null) {
            if (this.attack.removeFromWorld == true) {
                this.attack = null;
                if (!this.onGround) {
                    this.haltMovement = true; this.attackCooldown = ATTACK_COOLDOWN / 2
                    console.log("Cooldown After Attack = " + this.attackCooldown)
                }
            } else {
                this.attack.x = this.isRight? this.x + this.width + 10 : this.x - this.width - 10 - 32;
                this.onGround? this.attack.y = this.y - 10 : this.attack.y = this.y + 10;
            }

        }

        this.warningTimer -= 1;
        if (this.warningTimer <= 0) {
            this.warningText = null;
        }

        // if(this.attackCooldown > 0) {
            this.attackCooldown -= 1;
        // }
    }

    tryAttack() {
        if (this.haltMovement == false && engine.input.click && this.attackCooldown <= 0 && this.inventory.getEquippedSlot() === null) {
            if (this.onGround) {
                this.setAnimationState("IdleAttack")
            } else {
                this.setAnimationState("AirAttack")
                console.log("Cooldown = " + this.attackCooldown);
            }
            this.haltMovement = true;
            this.squat = null;
            if (this.onGround) { // spawn it with respect to width and height if facing right
                this.attackCooldown = ATTACK_COOLDOWN * 2;
                this.attack = new BladeHitbox(this.isRight? this.x + this.width + 10 : this.x - 10, this.y - 10, 58, 58, ATTACK_COOLDOWN, this.isRight);
            } else {
                this.attackCooldown = ATTACK_COOLDOWN * 1.5;
                this.attack = new AerialBladeHitbox(this.isRight? this.x + this.width + 10: this.x - 10, this.y / this.height, 58, 32, ATTACK_COOLDOWN, this.isRight);
            }
            engine.addEntity(this.attack);
        }
    }

    reduceHealth(amt) {
        if (this.invincibilityTicks > 0) {return;}
        this.invincibilityTicks = INVINCIBILITY_DURATION;
        this.health -= amt;
    }

    /** @param {GameEngine} engine */
    move(engine) {
        // movement
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
            if (engine.input.left) {
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
            this.attackCooldown = 0;
            this.haltMovement = true;
            this.squat = true;
            if (engine.input.jump) {this.bufferedJump = true}
        }
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {GameEngine} engine
     * @param {number} deltaTime
     */
    draw(ctx, engine, deltaTime) {
        if (this.haltMovement === true && this.animations[this.animationState].isDone()) {this.goDefaultState();}
        if (this.doNotUpdate) {this.goDefaultState()}
        if (CONSTANTS.DEBUG == true) {
            ctx.strokeStyle = "#aa0000";
            ctx.strokeRect(floor(this.x) - engine.camera.x, this.y - engine.camera.y, this.width, this.height);
        }

        if (this.warningTimer > 0) {
            // console.log(this.warningText)
            ctx.save()
            ctx.font = "10px monospace";
            ctx.fillStyle = "rgb(219, 100, 100)"
            ctx.strokeStyle = "rgba(40, 40, 40, 0.62)"

            const fontHeight = 10;
            let textX = this.warningUIx + (this.warningUIWidth / 2);
            let textY = this.warningUIy;
            for (let i = 0; i < this.warningLines.length; i++) {
                ctx.fillText(this.warningLines[i], textX - (ctx.measureText(this.warningLines[i]).width / 2), textY)
                textY += fontHeight;
            }
            // ctx.strokeText(this.warningText, this.warningUIx, this.warningUIy)
            // ctx.fillText(this.warningText, this.warningUIx, this.warningUIy);
            ctx.restore()
        }

        if (!this.onGround) {
            if (this.attack) {
                this.animations[this.animationState].drawFrame(deltaTime, ctx,
                (this.x - (20)) - engine.camera.x, floor(this.y) - (this.height) + (32) - floor(engine.camera.y),
                !this.isRight, 2)
                return;
            }
            this.animations["Jump"].drawFramePlain(ctx,
                (this.x - (20)) - engine.camera.x, floor(this.y) - (this.height) + (32) - floor(engine.camera.y),
                2, this.getJumpFrame(), !this.isRight);
        } else {
            this.animations[this.animationState].drawFrame(deltaTime, ctx,
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
    }

    displayPlayerWarning(Text, override) {
        if (this.warningTimer > 0 && !override) {
            return;
        }
        console.log(Text);
        const ctx = CONSTANTS.CONTEXT;
        this.warningText = Text;
        this.warningTimer = WARNING_DURATION;
        // console.log("Warning Timer: " + this.warningTimer + ", Text: " + this.warningText)

        let words = Text.split(' ');
        let line = '';
        let lines = [];

        for (let i = 0; i < words.length; i++) {
            let sampleLine = line + words[i] + " ";
            if (ctx.measureText(sampleLine).width > this.warningUIWidth) {
                lines.push(line.slice(0, -1));
                line = words[i] + ' ';
            } else {
                line = sampleLine;
            }
        }
        lines.push(line.slice(0, -1));
        this.warningLines = lines;
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
        const animationTime = (this.timer / 4) / CONSTANTS.TICKS_PER_SECOND;
        this.animation = new Animator(ASSET_MANAGER.getAsset("/Assets/Player/BladeEffect-Sheet.png"), 0, 0, 32, 32, 7, animationTime, 0, false, false);
    }

    update(engine) {
        this.decrementTimer();
        if (this.timer <= 0) {
            this.removeFromWorld = true;
        }

        for(const entity of engine.entities[3]) {
            if ((entity instanceof MovingEntity || entity instanceof FlyingEnemy) && this.isCollidingWith(entity)) {
                entity.onAttack();
            }
        }
    }

    draw(ctx, engine, deltaTime) {
        this.animation.drawFrame(deltaTime, ctx,
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
        const animationTime = (this.timer / 4) / CONSTANTS.TICKS_PER_SECOND;
        this.animation = new Animator(ASSET_MANAGER.getAsset("/Assets/Player/BladeEffect-Sheet.png"), 0, 32, 32, 32, 7, animationTime, 0, false, false);
    }

    draw(ctx, engine, deltaTime) {
        this.animation.drawFrame(deltaTime, ctx,
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
