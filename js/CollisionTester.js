/** @import GameEngine from "/js/GameEngine.js" */
import WorldEntity from './AbstractClasses/WorldEntity.js';

export default class CollisionTester extends WorldEntity {
    constructor() {
        super();
        this.width = 36;
        this.height = 36;
    }

    update(engine) {
        if (engine.mouse) {
            this.x = engine.mouse.x;
            this.y = engine.mouse.y;
        }
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {GameEngine} engine
     */
    draw(ctx, engine) {
        if (engine.getLevel().checkIfBoxCollides(this.x, this.y, this.width, this.height)) {
            ctx.fillStyle = "#00ff00";
        } else {
            ctx.fillStyle = "#0000ff";
        }
        for (const entity of engine.entities) {
            if (entity !== this && entity.isCollidingWith && this.isCollidingWith(entity)) {
                ctx.fillStyle = "#008888";
                break;
            }
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
