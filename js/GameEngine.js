/** @import Entity from "/js/Entity.js" */
/** @import Level from "/js/Level.js" */
/** @import Player from "/js/Player.js" */
/** @import Cursor from "/js/GeneralUtils/Cursor.js" */

import SaveDataRetrieval from "./GeneralUtils/SaveDataRetrieval.js";
import EntityInteractable from "/js/AbstractClasses/EntityInteractable.js";
import InGameClock from "/js/InGameClock.js";
import { CONSTANTS } from "/js/Util.js";
import CookingStationManager from "/js/CookingStationManager.js";

const INPUT_MAP = {
    "KeyW": "up",
    "KeyA": "left",
    "KeyS": "down",
    "KeyD": "right",
    "Space": "jump",
    "KeyE": "interact",
    // alternate platformer style controls (like hollow knight, celeste, etc. can change if necessary)
    "ArrowUp": "up",
    "ArrowDown": "down",
    "ArrowLeft": "left",
    "ArrowRight": "right",
    "KeyC": "jump",
};

// the amount of time per engine tick
const TICK_TIME = CONSTANTS.TICK_TIME;

// the amount of layers in the entity array
const ENTITY_LAYER_COUNT = 8;

// This game shell was happily modified from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011
export default class GameEngine {
    constructor(options) {
        // What you will use to draw
        // Documentation: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
        this.ctx = null;

        // Everything that will be updated and drawn each frame
        /** @type {Entity[]} */
        this.entities = [];

        for (let i = 0; i < ENTITY_LAYER_COUNT; i++) {
            this.entities.push([])
        }


        // Information on the input
        this.click = null;
        this.mouse = null;
        this.wheel = null;
        this.input = Object.create(null);
        this.save = new SaveDataRetrieval()

        // Options and the Details
        this.options = options || {
            debugging: false,
        };

        this.stationManager = new CookingStationManager();
        this.stationManager.createStation("1");
        this.stationManager.createStation("2");

        this.customerManager = null;
    };

    /** @param {CanvasRenderingContext2D} ctx */
    init(ctx) {
        this.ctx = ctx;
        this.startInput();
        this.timeAccumulator = 0;
        this.lastTimestamp = 0;
    };

    start() {
        this.running = true;
        const gameLoop = now => {
            this.loop(now);
            window.requestAnimationFrame(gameLoop);
        };
        window.requestAnimationFrame(gameLoop);
    };

    startInput() {
        const getXandY = e => ({
            x: e.clientX - this.ctx.canvas.getBoundingClientRect().left,
            y: e.clientY - this.ctx.canvas.getBoundingClientRect().top
        });

        this.ctx.canvas.addEventListener("mousedown", e => {
            const pos = getXandY(e);
            this.click = pos;
            this.mouseDown = pos;
        });

        this.ctx.canvas.addEventListener("mouseup", e => {
            this.mouseUp = getXandY(e);
            this.click = null;
        });

        this.ctx.canvas.addEventListener("mousemove", e => {
            this.mouse = getXandY(e);
        })

        this.ctx.canvas.addEventListener("wheel", e => {
            if (this.options.debugging) {
                console.log("WHEEL", getXandY(e), e.wheelDelta);
            }
            e.preventDefault(); // Prevent Scrolling
            this.wheel = e;
        });

        this.ctx.canvas.addEventListener("contextmenu", e => {
            if (this.options.debugging) {
                console.log("RIGHT_CLICK", getXandY(e));
            }
            e.preventDefault(); // Prevent Context Menu
            this.rightclick = getXandY(e);
        });

        this.ctx.canvas.addEventListener("keydown", event => {
            this.input[INPUT_MAP[event.code]] = true;
            event.preventDefault();
        });
        this.ctx.canvas.addEventListener("keyup", event => {
            this.input[INPUT_MAP[event.code]] = false;
            event.preventDefault();
        });
    };


    /** @param {Number} layer the layer of the entity 0-7, higher layers get rendered to the front, and layers exceeding 7 default to layer 7, 3 by default*/
    /** @param {*} entity the entity to be added, must have a draw() or update() method */
    addEntity(entity, layer) {
        let row;
        if (!layer || layer < 0) {
            row = 4;
        } else {
            row = layer;
            if (layer > ENTITY_LAYER_COUNT) {
                row = ENTITY_LAYER_COUNT - 2;
            }
        }
        if (entity instanceof EntityInteractable) {
            row = 3;
        }
        const rowArray = this.entities[row];
        rowArray.push(entity);
    };

    /**
     * Adds a UI entity to the top layer, always being under the mouse (having the layer be)
     * @param {*} entity Entity that will be added the UI layer
     */
    addUIEntity(entity) {
        const rowArray = this.entities[ENTITY_LAYER_COUNT - 1];
        rowArray.splice(rowArray.length - 1, 0, entity);
    }

    // the Level is a special entity that many other entities will need to access directly
    /** @param {Level} level */
    setLevel(level) {
        this.addEntity(level, 2);
        this.level = level;
    }
    getLevel() {
        return this.level;
    }

    // same w/ the player
    /** @param {Player} player */
    setPlayer(player) {
        this.addEntity(player);
        this.player = player;
    }

    getPlayer() {
        return this.player
    }



    getSaveObject() {
        return this.save;
    }

    /** @param {Cursor} cursor */
    setCursor(cursor) {
        // if (this.cursor) {
        //     this.cursor.removeFromWorld = true;
        // }
        const UIArray = this.entities[ENTITY_LAYER_COUNT - 1];
        UIArray.push(cursor);
        this.cursor = cursor;
    }

    getCursor() {
        return this.cursor;
    }

    // signals which mouse sprite to change to. 0 is a normal sprite, while 1 is a pointer sprite.
    /** @param {Number} signal */
    setMouseSignal(signal) {
       this.cursor.setSprite(signal);
    }

    // the in-game clock may also need to be accessed by many other entities who use logic that's virtually timed.
    /** @param {InGameClock} clock */
    setClock(clock) {
        this.addEntity(clock, 6);
        this.clock = clock;
    }

    getClock() {
        return this.clock;
    }

    draw() {
        // Clear the whole canvas with transparent color (rgba(0, 0, 0, 0))
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        for (const entityLayer of this.entities) {
            if (!entityLayer) {
                continue;
            }

            for (const entity of entityLayer) {
                entity.draw(this.ctx, this);
            }
        }
    };

    update() {
        let entitiesCount = ENTITY_LAYER_COUNT;

        //iterate through all layers
        for (let i = 0; i < entitiesCount; i++) {
            const entityLayer = this.entities[i];

            if (!entityLayer) {
                continue;
            }

            let entityColumns = entityLayer.length;

            //iterate through an individual layer
            for (let j = 0; j < entityColumns; j++) {
                let entity = entityLayer[j];

                if (!entity.removeFromWorld) {
                    entity.update(this);
                } else { // small change to remove elements without re-iterating through the entity list
                    if (CONSTANTS.DEBUG) {
                        console.log("Just destroyed " + entity.constructor.name)
                    }
                
                    entityLayer.splice(j, 1);
                    j--;
                    entityColumns--;
                }
            }
        }

        if (this.customerManager) {
            this.customerManager.update();
        }
    };

    loop(now) {
        const deltaTime = (now - this.lastTimestamp) / 1000; // delta time in seconds
        this.lastTimestamp = now;

        // use a fixed timestep to behave identically at different refresh rates
        this.timeAccumulator += deltaTime;
        if (this.timeAccumulator > TICK_TIME) {
            this.update();
            this.timeAccumulator -= TICK_TIME;
        }
        if (this.timeAccumulator > TICK_TIME * 5) {  // remove extra steps worth of time that could not be processed
            // console.warn(`update took too long! behind by ${Math.floor(this.timeAccumulator / TICK_TIME)}ms`);
            this.timeAccumulator = this.timeAccumulator % TICK_TIME;
        }

        this.draw(deltaTime);
        this.ctx.fillStyle = "black";
        this.ctx.fillText(`fps: ${(1 / deltaTime).toFixed(2)}`, 0, 12);
    }
}
