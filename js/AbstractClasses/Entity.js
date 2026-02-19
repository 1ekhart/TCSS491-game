/** @import GameEngine from "/js/GameEngine.js" */

/** @import SaveDataRetrieval from "../GeneralUtils/SaveDataRetrieval.js"; */

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

    /**
     * saves the state of the entity, may be empty in the case of a stateless entity, an optional method.
     * @param {SaveDataRetrieval} saveObject the saveObject that the item will be saved to.
     */
    save(saveObject) { }
}
