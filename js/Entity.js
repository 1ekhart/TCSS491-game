/** @import GameEngine from "/js/GameEngine.js" */

// base entity class; all entities should probably inherit from this
export default class Entity {
    constructor() { }

    /** removes this entity from the world */
    remove() {
        this.removeFromWorld = true;
    }

    /** @param {GameEngine} engine */
    update(engine) { }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {GameEngine} engine
     */
    draw(ctx, engine) { }
}
