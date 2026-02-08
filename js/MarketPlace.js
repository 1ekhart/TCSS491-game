import EntityInteractable from "/js/AbstractClasses/EntityInteractable.js";
import OnScreenTextSystem from "/js/GeneralUtils/OnScreenText.js";
import MarketPlaceUI from "/js/MarketplaceUI.js";
import Player from "/js/Player.js";
import { CONSTANTS } from "/js/Util.js";

export default class MarketPlace extends EntityInteractable {
    constructor(engine, x, y, width, height) {
        super();
        this.engine = engine;
        this.width = width * 2;
        this.height = height * 2;
        this.x = x - (width / 2);
        this.y = y - (height / 2);

        this.renderX = x;
        this.renderY = y;
        this.prompt = new OnScreenTextSystem(this,
                    x + (width / 4), y - (height / 4), `Open Marketplace`, false);
        engine.addEntity(this.prompt);
        this.displaying = false;
    }

    update(engine) {
        if (!engine.entities[4]) return;
        for (const entity of engine.entities[4]) {
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
        if (this.displaying == true) {return;}
        this.prompt.hideText();
        const MarketplaceUI = new MarketPlaceUI(this.engine, this);
        this.displaying = true;
        this.engine.addUIEntity(MarketplaceUI);
    }
    
    draw(ctx, engine) {
        ctx.fillStyle = "#fed18e";
        ctx.fillRect(this.renderX - engine.camera.x, this.renderY - engine.camera.y,
        this.width / 2, this.height / 2);
    
        if (CONSTANTS.DEBUG == true) {
            ctx.strokeStyle = "#aa0000";
            ctx.strokeRect(Math.floor(this.x - engine.camera.x), Math.floor(this.y - engine.camera.y), this.width, this.height);
        }
    }
    
}