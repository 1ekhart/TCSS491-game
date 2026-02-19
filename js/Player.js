/** @import GameEngine from "/js/GameEngine.js" */
import WorldEntity from "/js/AbstractClasses/WorldEntity.js";
import Animator from "/js/GeneralUtils/Animator.js";
import HitBox from "/js/GeneralUtils/Hitbox.js";
import Inventory from "/js/Inventory.js";
import MovingEntity from "/js/MovingEntity.js";
import { CONSTANTS, decreaseToZero } from "/js/Util.js";

const floor = Math.floor;

const WALKING_SPEED = 6;
const ACCELERATION = 1;
const JUMPING_STRENGTH = -9.5;
const GRAVITY = 0.6;
const ATTACK_COOLDOWN = 0.3;

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
        this.attackTimer = ATTACK_COOLDOWN;
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
            if (!engine.entities[3]) return;
            for (const entity of engine.entities[3]) {
                if (entity instanceof WorldEntity && this.isCollidingWith(entity)) {
                    if (entity.interact) {
                        entity.interact(this);
                    }
                }
            }
        }

        if (this.haltMovement == false && engine.click && this.attackTimer <= 0) {
            this.setAnimationState("IdleAttack")
            this.haltMovement = true;
            this.attackTimer = ATTACK_COOLDOWN;
            if (this.isRight) { // spawn it with respect to width and height if facing right
                engine.addEntity(new BladeHitbox(this.x + this.width + 10, this.y, 48, 48, ATTACK_COOLDOWN, true))
            } else {
                engine.addEntity(new BladeHitbox(this.x, this.y, 48, 48, ATTACK_COOLDOWN, true))
            }
        }

        this.attackTimer -= CONSTANTS.TICK_TIME;
    }

    tryAttack() {
        if (engine.click && this.attackTimer <= 0) {
            this.setAnimationState("IdleAttack")
            this.haltMovement = true;
            this.attackTimer = ATTACK_COOLDOWN;
            if (this.isRight) { // spawn it with respect to width and height if facing right
                engine.addEntity(new BladeHitbox(this.x + this.width + 10, this.y, 48, 48, ATTACK_COOLDOWN, true))
            } else {
                engine.addEntity(new BladeHitbox(this.x - 10, this.y, 48, 48, ATTACK_COOLDOWN, false))
            }
        }
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
                this.xVelocity = decreaseToZero(this.xVelocity, GRAVITY / 2); // deceleration with no inputs held
            }
            if (this.onGround && engine.input.jump) {
                this.yVelocity = JUMPING_STRENGTH;
            }
        } else {
            this.xVelocity = decreaseToZero(this.xVelocity, GRAVITY / 2); // deceleration with no inputs held
        }

        if (this.haltMovement == false) {
            if (engine.click) {
                this.tryAttack();
            } else if (engine.input.left) {
                this.setAnimationState("Run");
                this.isRight = false;
            } else if (engine.input.right) {
                this.setAnimationState("Run");
                this.isRight = true;
            } else {
                this.setAnimationState("Idle");
            }
        }

        // gravity
        if (engine.input.jump && this.yVelocity < 0) {
            this.yVelocity += (GRAVITY / 2);
        } else if (engine.input.down){
            this.yVelocity += (GRAVITY * 1.5);
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
            (this.x - (20)) - engine.camera.x, floor(this.y) - (this.height) + (32) - floor(engine.camera.y),
             !this.isRight, 2)
        if (CONSTANTS.DEBUG == true) {
            ctx.strokeStyle = "#aa0000";
            ctx.strokeRect(floor(this.x) - engine.camera.x, this.y - engine.camera.y, this.width, this.height);
        }
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
            this.facingLeftOffset = this.width / 2
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
            }
        }
    }

    draw(ctx, engine) {
        this.animation.drawFrame(CONSTANTS.TICK_TIME, ctx,
            this.x - engine.camera.x - this.facingLeftOffset, this.y - engine.camera.y - 20, !this.isFacingRight, 2);

        if (CONSTANTS.DEBUG == true) {
            ctx.strokeStyle = "#aa0000";
            ctx.strokeRect(floor(this.x) - engine.camera.x, this.y - engine.camera.y, this.width, this.height);
        }
    }


}
