/** @import GameEngine from "/js/GameEngine.js" */
import Interactable from './Interactable.js';
import { CONSTANTS } from '/js/Util.js';

// size of a tile in screen pixels
const TILE_SIZE = 32;
//For some reason the player's Y coordinate is always (n block + 0.46875) * 32
const Y_FIX = 0.46875;
const HORIZONTAL_FORGIVENESS = 16; // don't move the camera horizontally if the player hasn't moved this far from the middle.
const VERTICAL_FORGIVENESS = 16; // don't move the camera vertically if the player hasn't moved this far from the middle.

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

const level1 = [
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
    [2, 0, 0, 0, 0, 0, 0, 0, 2, 1, 1, 1, 1, 2, 1, 0, 0, 0, 1, 1, 1, 1, 2, 1, 0, 0, 0],
    [2, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0],
    [2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
]

const level2 = [
    [2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 1, 1, 1, 1, 1, 1, 1, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2]
]

export default class LevelManager {
    constructor(engine) {
        this.toggleCooldown = 1;
        engine.camera = this;
        this.elapsedTime = 0;
        this.data = level1;
        this.player = engine.getPlayer();
        this.player.x = 4 * TILE_SIZE;
        this.player.y = 1 * TILE_SIZE;
        this.x = this.player.x;
        this.y = this.player.y;
    }

    teleport(level, x, y) {
        if (level == 2) {
            this.data = level2;
        } else if (level == 1) {
            this.data = level1;
        }

        this.player.x = x * TILE_SIZE;
        this.player.y = y * TILE_SIZE;
    }

    //Handling level transitions and player movement
    update(engine) {
        // let horizontalMidpoint = (CONSTANTS.CANVAS_WIDTH / 2) / 2;
        // let verticalMidpoint = (CONSTANTS.CANVAS_HEIGHT / 2) / 2;
        // if (this.x < this.player.x - (horizontalMidpoint) - HORIZONTAL_FORGIVENESS) {
        //     this.x = (this.player.x - horizontalMidpoint) - HORIZONTAL_FORGIVENESS - CONSTANTS.CANVAS_WIDTH / TILE_SIZE;
        // }
        // if (this.x > this.player.x + horizontalMidpoint + HORIZONTAL_FORGIVENESS) {
        //     this.x = (this.player.x + horizontalMidpoint) + HORIZONTAL_FORGIVENESS - CONSTANTS.CANVAS_WIDTH/ TILE_SIZE;
        // }

        this.x = (this.player.x + this.player.width / (2 * CONSTANTS.SCALE)) - CONSTANTS.CANVAS_WIDTH / (2 * CONSTANTS.SCALE)
        // this.y = (this.player.y + this.player.height / 2) - CONSTANTS.CANVAS_HEIGHT / 2

        // if (this.y > this.player.y - verticalMidpoint) {
        //     this.y = this.player.y - verticalMidpoint;
        // }

        // if (this.y < this.player.y + verticalMidpoint) {
        //     this.y = this.player.y + verticalMidpoint;
        // }

        // if (this.x < this.player.x - HORIZONTAL_FORGIVENESS) {
        //     console.log(this.x)
        //     this.x = this.player.x - HORIZONTAL_FORGIVENESS ; 
        // }

        // if (this.x > this.player.x + HORIZONTAL_FORGIVENESS) {
        //     console.log(this.x)
        //     this.x = this.player.x + HORIZONTAL_FORGIVENESS;
        // }



        // if (player.x <= -0 * TILE_SIZE && Math.floor(player.y) >= 7 * TILE_SIZE && Math.floor(player.y) < 8 * TILE_SIZE && this.data === tileData1) {
        //     console.log("1 to 2")
        //     this.data = tileData2;
        //     player.x = 8 * TILE_SIZE ;
        //     player.y = (7 + Y_FIX) * TILE_SIZE - 1;
        // }
        // if (player.x > 8 * TILE_SIZE && Math.floor(player.y) >= 7 * TILE_SIZE && Math.floor(player.y) < 8 * TILE_SIZE && this.data === tileData2) {
        //     console.log("2 to 1")
        //     this.data = tileData1;
        //     player.x = 0 * TILE_SIZE;
        //     player.y = (7 + Y_FIX) * TILE_SIZE - 1;
        // }
        // if (player.x < -0 * TILE_SIZE && Math.floor(player.y) >= 7 * TILE_SIZE && Math.floor(player.y) < 8 * TILE_SIZE && this.data === tileData2) {
        //     console.log("2 to 3")
        //     this.data = tileData3;
        //     player.x = 8 * TILE_SIZE;
        //     player.y = (7 + Y_FIX) * TILE_SIZE - 1;
        // }
        // if (player.x > 8 * TILE_SIZE && Math.floor(player.y) >= 7 * TILE_SIZE && Math.floor(player.y) < 8 * TILE_SIZE && this.data === tileData3) {
        //     console.log("3 to 2")
        //     this.data = tileData2;
        //     player.x = 0 * TILE_SIZE;
        //     player.y = (7 + Y_FIX) * TILE_SIZE - 1;
        // }
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
        // ctx.strokeStyle = "#aa0000";
        // ctx.strokeRect((CONSTANTS.CANVAS_WIDTH/2 - HORIZONTAL_FORGIVENESS) * CONSTANTS.SCALE, 
        // (CONSTANTS.CANVAS_HEIGHT/2 - VERTICAL_FORGIVENESS) * CONSTANTS.SCALE,
        // HORIZONTAL_FORGIVENESS * 2 * CONSTANTS.SCALE, VERTICAL_FORGIVENESS * 2 * CONSTANTS.SCALE)

        for (let row = 0; row < dataLength; row++) {
            const rowData = data[row];
            const rowDataLength = rowData.length;

            for (let column = 0; column < rowDataLength; column++) {
                const tile = rowData[column];
                if (tile > 0) {
                    // temporary box graphics for tiles
                    ctx.fillStyle = tileColors[tile];
                    ctx.fillRect(column * TILE_SIZE- this.x, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            }
        }
    }
}
