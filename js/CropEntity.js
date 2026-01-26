/** @import Player from "/js/Player.js" */
import WorldEntity from "/js/AbstractClasses/WorldEntity.js";
import { CONSTANTS } from "/js/Util.js";

export default class CropEntity extends WorldEntity {
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

        const item = {
            itemID : "Lettuce",
            quantity: 1
        };

        player.inventory.addItem(item);
    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx) {
        ctx.fillStyle = "#aaff00"
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
