// TODO: better map editing
// TODO: ability to swap out different maps

import Interactable from './Interactable.js';

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
    [0, 0, 0, 3, 0, 0, 0, 0, 0],
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
    [0, 0, 0, 3, 0, 0, 0, 0, 0],
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

var currentLevel = tileData1;



export default class LevelManager {
    constructor(engine) {
        this.toggleCooldown = 1;
        this.elapsedTime = 0;
        this.data = currentLevel;
        // cycle through the tile data to pick which ones are entities to add to the level

        for (let row = 0; row < this.data.length; row++) {
            const rowData = this.data[row];
            const rowDataLength = rowData.length;

            for (let column = 0; column < rowDataLength; column++) {
                const tile = rowData[column];
                if (tile == 3) {
                    engine.addEntity(new Interactable(column * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE));
                }
            }
        }
    }
    //Handling level transitions and player movement
    //As is I just manually go and grab the player entity from the entities list because I'm lazy and maybe because I forget how
    //If the load order changes in main the player const will need to be updated to wherever the player is :)
    update(engine) {
        const player = engine.entities[2];
        if (player.x < -0.25 * TILE_SIZE && Math.floor(player.y) >= 7 * TILE_SIZE && Math.floor(player.y) < 8 * TILE_SIZE && currentLevel == tileData1) {
            console.log("1 to 2")
            currentLevel = tileData2;
            this.data = currentLevel;
            player.x = 8 * TILE_SIZE ;
            player.y = (7 + Y_FIX) * TILE_SIZE - 1;
        }
        if (player.x > 8.25 * TILE_SIZE && Math.floor(player.y) >= 7 * TILE_SIZE && Math.floor(player.y) < 8 * TILE_SIZE && currentLevel == tileData2) {
            console.log("2 to 1")
            currentLevel = tileData1;
            this.data = currentLevel;
            player.x = 0 * TILE_SIZE;
            player.y = (7 + Y_FIX) * TILE_SIZE - 1;
        }
        if (player.x < -0.25 * TILE_SIZE && Math.floor(player.y) >= 7 * TILE_SIZE && Math.floor(player.y) < 8 * TILE_SIZE && currentLevel == tileData2) {
            console.log("2 to 3")
            currentLevel = tileData3;
            this.data = currentLevel;
            player.x = 8 * TILE_SIZE;
            player.y = (7 + Y_FIX) * TILE_SIZE - 1;
        }
        if (player.x > 8 * TILE_SIZE && Math.floor(player.y) >= 7 * TILE_SIZE && Math.floor(player.y) < 8 * TILE_SIZE && currentLevel == tileData3) {
            console.log("3 to 2")
            currentLevel = tileData2;
            this.data = currentLevel;
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
        const right = (boxX + width) >> 5;
        const top = boxY >> 5;
        const bottom = (boxY + height) >> 5;

        // check all tiles that the box overlaps
        for(let x = left; x <= right; x++) {
            for(let y = top; y <= bottom; y++) {
                if(this.getTile(x, y) !== 0 && this.getTile(x, y) < 3) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {import('/js/GameEngine.js').default} engine
     */
    draw(ctx, engine) {
        const data = this.data;
        const dataLength = data.length;

        for (let row = 0; row < dataLength; row++) {
            const rowData = data[row];
            const rowDataLength = rowData.length;

            for (let column = 0; column < rowDataLength; column++) {
                const tile = rowData[column];
                if (tile > 0 && tile < 3) {
                    // temporary box graphics for tiles
                    ctx.fillStyle = tileColors[tile];
                    ctx.fillRect(column * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            }
        }
    }
}
