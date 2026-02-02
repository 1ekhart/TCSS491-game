/** @import GameEngine from "/js/GameEngine.js" */
import Interactable from './Interactable.js';
import InGameClock from '/js/InGameClock.js';
import PottedPlant from '/js/PottedPlant.js';
import Teleporter from '/js/Teleporter.js';
import Oven from "/js/Oven.js";
import PrepStation from "/js/PrepStation.js";
import CookingStation from "/js/CookingStation.js";
import { CONSTANTS } from '/js/Util.js';

// size of a tile in screen pixels
const TILE_SIZE = 32;

// sets the game to this hour (15:00)
const ResetHour = 15;

// don't move the camera horizontally/vertically if the player hasn't moved this far from the middle.
const HORIZONTAL_FORGIVENESS = 1 * CONSTANTS.TILESIZE;
const VERTICAL_FORGIVENESS = 1 * CONSTANTS.TILESIZE;

// offset the camera by this much to center the player
const CAMERA_OFFSET_X = CONSTANTS.CANVAS_WIDTH / (2 * CONSTANTS.SCALE);
const CAMERA_OFFSET_Y = CONSTANTS.CANVAS_HEIGHT / (1.75 * CONSTANTS.SCALE);  // edit the number to change the vertical position of the camera

const tileColors = [
    "#000000",
    "#774400",
    "#444444",
    "#b3874e",
    "#6aa84f"
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
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
]
const level3 = [
	[0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
	[0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	[0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[0, 4, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[0, 4, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[0, 4, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[0, 4, 4, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 1],
	[0, 4, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 1],
	[0, 4, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 3, 3, 3, 0, 0, 3, 3, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 1],
	[0, 4, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1],
	[0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 2],
	[0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 0, 0, 0, 2],
	[0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 1, 0, 0, 2],
	[0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 1, 0, 0, 2],
	[0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 1, 1, 0, 2],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 3, 0, 2],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 3, 0, 2],
	[0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	[0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 4, 0, 0, 0, 0, 0, 0, 4, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 4, 4, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

]

export default class LevelManager {
    constructor(engine) {
        this.toggleCooldown = 1;
        engine.camera = this;
        this.engine = engine;
        this.elapsedTime = 0;
        this.sceneEntities =  [];
        this.loadLevel1();
        this.player = engine.getPlayer();
        this.player.x = 1 * TILE_SIZE;
        this.player.y = 1 * TILE_SIZE;
        this.x = this.player.x;
        this.y = this.player.y;
        this.reloadClock();

        //  keeps track of entities so we can load or destroy all of the entities in a particular scene.

    }

    //Initialize level 1;
    loadLevel1() {
        // refresh scene entities
        this.sceneEntities.forEach(function (entity) {
            entity.removeFromWorld = true;
        })
        this.data = level1;

        this.sceneEntities = [];
        this.sceneEntities.push(new Interactable(4 * TILE_SIZE - (TILE_SIZE/2), 4 * TILE_SIZE - (TILE_SIZE/2), TILE_SIZE*2, TILE_SIZE*2, this.engine));
        this.sceneEntities.push(new Interactable(2 * TILE_SIZE - (TILE_SIZE/2), 8 * TILE_SIZE - (TILE_SIZE/2), TILE_SIZE*2, TILE_SIZE*2, this.engine));
        this.sceneEntities.push(new Teleporter(this.engine, 4*TILE_SIZE, 8*TILE_SIZE, TILE_SIZE, TILE_SIZE, 1));
        this.sceneEntities.push(new Teleporter(this.engine, 7*TILE_SIZE, 8*TILE_SIZE, TILE_SIZE, TILE_SIZE, 2));
        this.sceneEntities.push(new Teleporter(this.engine, 10*TILE_SIZE, 8*TILE_SIZE, TILE_SIZE, TILE_SIZE, 3));
        this.sceneEntities.push(new PottedPlant(this.engine, 12 * TILE_SIZE, 8 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 3, this.engine.getClock().dayCount));
        this.sceneEntities.push(new PottedPlant(this.engine, 15 * TILE_SIZE, 8 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 3, this.engine.getClock().dayCount));

        const engine = this.engine;
        this.sceneEntities.forEach(function (entity) {
            engine.addEntity(entity);
        })
        this.reloadClock();
    }

    //Initialize level 2
    loadLevel2() {
        this.sceneEntities.forEach(function (entity) {
            entity.removeFromWorld = true;
        })
        this.data = level2;

        this.sceneEntities = [];
        this.sceneEntities.push(new Teleporter(this.engine, 4*TILE_SIZE, 7*TILE_SIZE, TILE_SIZE, TILE_SIZE, 1))

        const engine = this.engine;
        this.sceneEntities.forEach(function (entity) {
            engine.addEntity(entity);
        })
        this.reloadClock();
    }

    loadLevel3() {
        this.sceneEntities.forEach(function (entity) {
            entity.removeFromWorld = true;
        })
        this.data = level3;

        this.sceneEntities = [];
        this.sceneEntities.push(new Teleporter(this.engine, 6*TILE_SIZE, 16*TILE_SIZE, TILE_SIZE, TILE_SIZE, 1));
        this.sceneEntities.push(new Teleporter(this.engine, 9*TILE_SIZE, 16*TILE_SIZE, TILE_SIZE, TILE_SIZE, 2));
        this.sceneEntities.push(new Oven(3 * TILE_SIZE - .5 * TILE_SIZE, 13 * TILE_SIZE - .5 * TILE_SIZE, 64, 64, this.engine));
        this.sceneEntities.push(new PrepStation(5 * TILE_SIZE, 13 * TILE_SIZE, TILE_SIZE, TILE_SIZE, new CookingStation("1"), this.engine));

        const engine = this.engine;
        this.sceneEntities.forEach(function (entity) {
            engine.addEntity(entity);
        })
        this.reloadClock();
    }

    reloadClock() {
        const clock = this.engine.getClock();
        this.engine.setClock(new InGameClock());
        this.engine.getClock().removeFromWorld = true;
        this.engine.setClock(clock);
    }

    teleport(level, x, y) {
        if (level === 1) {
            this.loadLevel1();
        } else if (level === 2) {
            this.loadLevel2();
        } else if (level === 3) {
            this.loadLevel3();
        }

        this.player.x = x * TILE_SIZE;
        this.player.y = y * TILE_SIZE;
    }

    //Handling level transitions and player movement
    update(engine) {
        // update the camera to fit player coordinates and stay centered.
        let relPlayerX = this.player.x + this.player.width / (2 * CONSTANTS.SCALE) - CAMERA_OFFSET_X;
        let relplayerY = this.player.y + this.player.height / (2 * CONSTANTS.SCALE) - CAMERA_OFFSET_Y;

        let leftOffsetX = relPlayerX - HORIZONTAL_FORGIVENESS;
        let rightOffsetX = relPlayerX + HORIZONTAL_FORGIVENESS;
        let topOffsetY = relplayerY - VERTICAL_FORGIVENESS;
        let lowOffsetY = relplayerY + VERTICAL_FORGIVENESS;

        if (this.x < leftOffsetX) {
            this.x = leftOffsetX;
        } else if (this.x > rightOffsetX) {
            this.x = rightOffsetX;
        }

        if (this.y < topOffsetY) {
            this.y = topOffsetY;
        } else if (this.y > lowOffsetY) {
            this.y = lowOffsetY;
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
                if (this.getTile(x, y) !== 0 && this.getTile(x,y) != 3) {
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

        if (CONSTANTS.DEBUG) {
        ctx.strokeStyle = "#706ccd";
        ctx.strokeRect((CAMERA_OFFSET_X - HORIZONTAL_FORGIVENESS),
        (CAMERA_OFFSET_Y - VERTICAL_FORGIVENESS),
        HORIZONTAL_FORGIVENESS * 2, VERTICAL_FORGIVENESS * 2)
        }


        for (let row = 0; row < dataLength; row++) {
            const rowData = data[row];
            const rowDataLength = rowData.length;

            for (let column = 0; column < rowDataLength; column++) {
                const tile = rowData[column];
                if (tile > 0) {
                    // temporary box graphics for tiles
                    ctx.fillStyle = tileColors[tile];
                    ctx.fillRect(column * TILE_SIZE - this.x, row * TILE_SIZE - this.y, TILE_SIZE, TILE_SIZE);
                }
            }
        }
    }
}
