/** @import Entity from "/js/Entity.js" */
/** @import Level from "/js/Level.js" */
/** @import Player from "/js/Player.js" */

import { CONSTANTS } from "/js/Util.js";

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

// This game shell was happily modified from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011
export default class GameEngine {
    constructor(options) {
        // What you will use to draw
        // Documentation: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
        this.ctx = null;

        // Everything that will be updated and drawn each frame
        /** @type {Entity[]} */
        this.entities = [];

        // Information on the input
        this.click = null;
        this.mouse = null;
        this.wheel = null;
        this.input = Object.create(null);

        // Options and the Details
        this.options = options || {
            debugging: false,
        };
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

        this.ctx.canvas.addEventListener("mousemove", e => {
            if (this.options.debugging) {
                console.log("MOUSE_MOVE", getXandY(e));
            }
            this.mouse = getXandY(e);
        });

        this.ctx.canvas.addEventListener("click", e => {
            if (this.options.debugging) {
                console.log("CLICK", getXandY(e));
            }
            this.click = getXandY(e);
        });

        this.ctx.canvas.addEventListener("wheel", e => {
            if (this.options.debugging) {
                console.log("WHEEL", getXandY(e), e.wheelDelta);
            }
            // e.preventDefault(); // Prevent Scrolling
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
        });
        this.ctx.canvas.addEventListener("keyup", event => {
            this.input[INPUT_MAP[event.code]] = false;
        });
    };

    addEntity(entity) {
        this.entities.push(entity);
    };

    // the Level is a special entity that many other entities will need to access directly
    /** @param {Level} level */
    setLevel(level) {
        this.addEntity(level);
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

    draw() {
        // Clear the whole canvas with transparent color (rgba(0, 0, 0, 0))
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        for (const entity of this.entities) {
            entity.draw(this.ctx, this);
        }

        if (this.inventoryUI) {
            this.inventoryUI.draw();
        }
    };

    update() {
        let entitiesCount = this.entities.length;

        for (let i = 0; i < entitiesCount; i++) {
            let entity = this.entities[i];

            if (!entity.removeFromWorld) {
                entity.update(this);
            }
        }

        // backpack
        if (this.click && this.inventoryUI) {
            this.inventoryUI.handleBackpackClick(this.click);
            this.click = null;
        }

        for (let i = this.entities.length - 1; i >= 0; --i) {
            if (this.entities[i].removeFromWorld) {
                this.entities.splice(i, 1);
            }
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
