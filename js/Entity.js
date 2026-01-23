// base entity class containing common useful behavior
// (you don't have to inherit from this; Level doesn't)

/** @import Player from "/js/Player.js" */
/** @import GameEngine from "/js/GameEngine.js" */

export default class Entity {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 32;
        this.height = 32;
    }

    /** @param {Entity} otherEntity */
    isCollidingWith(otherEntity) {
        return !( // - 1 is so width/height are actual width in pixels (not off by 1)
            (this.x + this.width - 1 < otherEntity.x) || (otherEntity.x + otherEntity.width - 1 < this.x) || // this LEFT of other OR this RIGHT of other OR
            (this.y + this.height - 1 < otherEntity.y) || (otherEntity.y + otherEntity.height - 1 < this.y)  // this ABOVE other OR this BELOW other
        );
    }

    /** @param {Player} player */
    interact(player) {

    }

    /** @param {GameEngine} engine */
    update(engine) {

    }

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
