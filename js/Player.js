/** @import GameEngine from "/js/GameEngine.js" */
import WorldEntity from "./WorldEntity.js";

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
        this.inventory = {
            "lettuce": 0,
        };
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
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {GameEngine} engine
     */
    draw(ctx, engine) {
        // temporary box graphics :)
        ctx.fillStyle = "#aa0000";
        ctx.fillRect(floor(this.x), floor(this.y), this.width, this.height);
    }
}
