/** @import Player from "/js/Player.js" */
import Entity from "/js/Entity.js";

export default class CropEntity extends Entity {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 32;
    }

    /** @param {Player} player */
    interact(player) {
        this.removeFromWorld = true;
        player.inventory["lettuce"] += 1;
    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx) {
        ctx.fillStyle = "#aaff00"
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
