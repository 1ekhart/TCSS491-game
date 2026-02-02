import EntityInteractable from "/js/AbstractClasses/EntityInteractable.js";
import { CONSTANTS } from "/js/Util.js";
import OnScreenTextSystem from "/js/GeneralUtils/OnScreenText.js";
import Player from "/js/Player.js";

export default class Teleporter extends EntityInteractable {
    constructor(engine, x, y, width, height, level) {
        super();
        this.engine = engine;
        this.width = width * 2;
        this.height = height * 2;
        this.x = x - (width / 2);
        this.y = y - (height / 2);
        this.level = level;

        this.renderX = x;
        this.renderY = y;
        this.prompt = new OnScreenTextSystem(this,
                    x + (width / 4), y - (height / 4), `Teleport to Level ${level}`, false);
                engine.addEntity(this.prompt);
    }

    update(engine) {
        for (const entity of engine.entities) {
            if (entity instanceof Player) {
                if (this.isCollidingWith(entity)) {
                    this.prompt.showText();
                } else {
                    this.prompt.hideText();
                }
            }
        }
    }

    /** @param {Player} player */
    interact(player) {
        let theX = 1;
        let theY = 1;
        if (this.level == 1) {
            theX = 17;
            theY = 1;
        } else if (this.level == 2) {
            theX = 2;
            theY = 2;
        } else if (this.level == 3) {
            theX = 4;
            theY = 15;
        }
        this.prompt.hideText();
        this.engine.camera.teleport(this.level, theX, theY);
    }

    draw(ctx, engine) {
        ctx.fillStyle = "#d37cd3";
        ctx.fillRect(this.renderX - engine.camera.x, this.renderY - engine.camera.y,
        this.width / 2, this.height / 2);

        if (CONSTANTS.DEBUG == true) {
            ctx.strokeStyle = "#aa0000";
            ctx.strokeRect(Math.floor(this.x - engine.camera.x), Math.floor(this.y - engine.camera.y), this.width, this.height);
        }
    }
}
