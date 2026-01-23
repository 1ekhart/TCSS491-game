/** @import GameEngine from "/js/GameEngine.js" */

// size of a tile in screen pixels
const TILE_SIZE = 32;

const tileColors = [
    "#000000",
    "#774400",
    "#444444"
];

export default class Level {
    constructor(tileData) {
        this.data = tileData;
    }

    update() {

    }

    getTile(tileX, tileY) {
        return this.data[tileY]?.[tileX];
    }

    checkIfBoxCollides(boxX, boxY, width, height) {
        // convert box position to tile coordinates (right shift by 5 is equivalent to floor divide by 32 (the TILE_SIZE))
        const left = boxX >> 5;
        const right = (boxX + width - 1) >> 5; // - 1 is so width/height are actual width in pixels (not off by 1)
        const top = boxY >> 5;
        const bottom = (boxY + height - 1) >> 5;

        // check all tiles that the box overlaps
        for (let x = left; x <= right; x++) {
            for (let y = top; y <= bottom; y++) {
                if (this.getTile(x, y) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {GameEngine} engine
     */
    draw(ctx, engine) {
        const data = this.data;
        const dataLength = data.length;

        for (let row = 0; row < dataLength; row++) {
            const rowData = data[row];
            const rowDataLength = rowData.length;

            for (let column = 0; column < rowDataLength; column++) {
                const tile = rowData[column];
                if (tile > 0) {
                    // temporary box graphics for tiles
                    ctx.fillStyle = tileColors[tile];
                    ctx.fillRect(column * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            }
        }
    }
}
