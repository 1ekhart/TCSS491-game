import Entity from "/js/AbstractClasses/Entity.js";

/** an Entity that contains common useful behavior for physical entities in the world */
export default class WorldEntity extends Entity {
    constructor() {
        super();
        this.x = 0;
        this.y = 0;
        this.width = 32;
        this.height = 32;
        this.xVelocity = 0;
        this.yVelocity = 0;
        this.onGround = false;
    }

    /** returns `true` if this entity is colliding with `otherEntity`.
     * @param {WorldEntity} otherEntity */
    isCollidingWith(otherEntity) {
        return !( // - 1 is so width/height are actual width in pixels (not off by 1)
            (this.x + this.width - 1 < otherEntity.x) || (otherEntity.x + otherEntity.width - 1 < this.x) || // this LEFT of other OR this RIGHT of other OR
            (this.y + this.height - 1 < otherEntity.y) || (otherEntity.y + otherEntity.height - 1 < this.y)  // this ABOVE other OR this BELOW other
        );
    }

    /** @param {GameEngine} engine */
    moveColliding() {
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

    /** called when the player presses interact while colliding with this entity
     * @param {Player} player */
    interact(player) { }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {GameEngine} engine
     */
    draw(ctx, engine) {
        // draw *something* if a subclass doesn't correctly draw anything
        ctx.fillStyle = "#ff00ff";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
