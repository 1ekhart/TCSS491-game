/** @import GameEngine from "/js/GameEngine.js" */
import Interactable from './Interactable.js';
import { CONSTANTS } from '/js/Util.js';

// size of a tile in screen pixels
const TILE_SIZE = 32;
//For some reason the player's Y coordinate is always (n block + 0.46875) * 32
const Y_FIX = 0.46875;

const tileColors = [
    "#000000",
    "#774400",
    "#444444"
];


const tileData1 = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 2, 1, 0, 0, 0],
    [2, 2, 2, 2, 2, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 2, 2, 2, 2, 2, 2, 2, 2]
];

const tileData2 = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 2, 1, 0, 0, 0],
    [2, 2, 2, 2, 2, 2, 2, 2, 2],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [2, 2, 2, 2, 2, 2, 2, 2, 2]
];

const tileData3 = [
    [2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 2, 2, 2, 2, 2],
    [2, 0, 0, 2, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 0, 0, 0],
    [2, 2, 2, 2, 2, 2, 2, 2, 2]
];

export default class LevelManager {
    constructor() {
        this.toggleCooldown = 1;
        this.elapsedTime = 0;
        this.data = tileData1;
    }

    //Handling level transitions and player movement
    update(engine) {
        const player = engine.getPlayer();
        if (player.x <= -0 * TILE_SIZE && Math.floor(player.y) >= 7 * TILE_SIZE && Math.floor(player.y) < 8 * TILE_SIZE && this.data === tileData1) {
            console.log("1 to 2")
            this.data = tileData2;
            player.x = 8 * TILE_SIZE ;
            player.y = (7 + Y_FIX) * TILE_SIZE - 1;
        }
        if (player.x > 8 * TILE_SIZE && Math.floor(player.y) >= 7 * TILE_SIZE && Math.floor(player.y) < 8 * TILE_SIZE && this.data === tileData2) {
            console.log("2 to 1")
            this.data = tileData1;
            player.x = 0 * TILE_SIZE;
            player.y = (7 + Y_FIX) * TILE_SIZE - 1;
        }
        if (player.x < -0 * TILE_SIZE && Math.floor(player.y) >= 7 * TILE_SIZE && Math.floor(player.y) < 8 * TILE_SIZE && this.data === tileData2) {
            console.log("2 to 3")
            this.data = tileData3;
            player.x = 8 * TILE_SIZE;
            player.y = (7 + Y_FIX) * TILE_SIZE - 1;
        }
        if (player.x > 8 * TILE_SIZE && Math.floor(player.y) >= 7 * TILE_SIZE && Math.floor(player.y) < 8 * TILE_SIZE && this.data === tileData3) {
            console.log("3 to 2")
            this.data = tileData2;
            player.x = 0 * TILE_SIZE;
            player.y = (7 + Y_FIX) * TILE_SIZE - 1;
        }
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
                    ctx.fillRect(column * TILE_SIZE * CONSTANTS.SCALE, row * TILE_SIZE * CONSTANTS.SCALE, TILE_SIZE * CONSTANTS.SCALE, TILE_SIZE * CONSTANTS.SCALE);
                }
            }
        }
    }
}
