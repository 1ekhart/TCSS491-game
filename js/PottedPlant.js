import EntityInteractable from "/js/AbstractClasses/EntityInteractable.js";
import Animator from "/js/GeneralUtils/Animator.js";
import OnScreenTextSystem from "/js/GeneralUtils/OnScreenText.js";
import Item from "/js/Item.js";
import Player from "/js/Player.js";
import { CONSTANTS, randomInt, randomIntRange } from "/js/Util.js";
import { getPlantData } from "/js/DataClasses/PotsAndPlants.js";

const potFill = "#6b583c";
const plantGrowing = "#476b3c"
const plantGrown = "#7cbc69"
export default class PottedPlant extends EntityInteractable {
    constructor(engine, x, y, width, height, plantID, dayPlaced) {
        super();
        this.engine = engine;
        this.width = width * 2;
        this.height = height * 2;
        this.x = x - (width / 2);
        this.y = y - (height / 2);
        this.plantID = plantID;
        this.dayPlaced = dayPlaced;

        // get the area where the pot is rendered
        this.renderX = x;
        this.renderY = y;
        this.renderWidth = width;
        this.renderHeight = height;
        this.plantID = plantID;
        this.initializePlant();
        this.prompt = new OnScreenTextSystem(this,
                    x + (width / 4), y - (height) - (height/4), `${this.plant.name} in day ${Math.floor(this.plant.growTime + dayPlaced / engine.clock.dayCount)}`, false);
        engine.addEntity(this.prompt);
        this.potSprite = new Animator(ASSET_MANAGER.getAsset("/Assets/WorldItems/grey-pot.png"), 0, 0, 32, 32, 1, 1, 0, false, false);
    }

    initializePlant() {
        this.plant = getPlantData(this.plantID);
        if (this.plant.regrows == false) {
            console.log(this.plant.name)
            this.plantSprite = new Animator(ASSET_MANAGER.getAsset(this.plant.assetName), 
            0, 0, 
            this.plant.width, this.plant.height, 3, 0, false, false);
        } else { // if plant doesn't regrow there's a 4th frame
            this.plantSprite = new Animator(ASSET_MANAGER.getAsset(this.plant.assetName), 
            0, 0, 
            this.plant.width, this.plant.height, 4, 0, false, false);
        }
    }

    getPercentGrown() {
        return engine.getClock().dayCount / (this.dayPlaced + this.plant.growTime);
    }

    

    update(engine) {
        const newText = `${this.plant.name} in ${Math.floor((this.plant.growTime + this.dayPlaced - 1) /engine.clock.dayCount)} days`
        this.prompt.changeText(newText);
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
        if (this.getPercentGrown() >= 1) {
            this.dayPlaced = this.engine.clock.dayCount;
            console.log("Interacted!")
            this.engine.addEntity(
                new Item(this.plantID, 
                    this.renderX + (this.width / 4), this.renderY - (this.height / 2), 
                    randomIntRange(10, -10), -5, 
                    randomInt(5))
            )
            if (this.plant.regrows == true) {
                this.dayPlaced = this.engine.clock.dayCount;
            }
        }
    }

    draw(ctx, engine) {
        this.potSprite.drawFramePlain(ctx, this.renderX - engine.camera.x, this.renderY - engine.camera.y, 1)

        // calculate the percentage growth it is
        const timePassed = this.getPercentGrown();

        var plantStage;
        if (timePassed >= 1) {
            plantStage = 2;
        } else if (timePassed >= 0.3) {
            plantStage = 1;
        } else {
            plantStage = 0;
        }

        if (this.plant.regrows == true && timePassed >= 0.5) { // if 50% grown and regrows, then show the readying harvest sprite
            plantStage = 3;
        }
            

        this.plantSprite.drawFramePlain(ctx, this.renderX - engine.camera.x, this.renderY - engine.camera.y - (this.plant.height*2) + 8, 2, plantStage);
        
        // ctx.fillRect((this.renderX + this.renderWidth - (this.renderWidth + plantWidth)/2) - engine.camera.x, (this.renderY - plantHeight) - engine.camera.y,
        // plantWidth, plantHeight);
        
        if (CONSTANTS.DEBUG == true) {
            ctx.strokeStyle = "#aa0000";
            ctx.strokeRect(Math.floor(this.x - engine.camera.x), Math.floor(this.y - engine.camera.y), this.width, this.height);
            ctx.strokeStyle = potFill;
            ctx.strokeRect(this.renderX - engine.camera.x, this.renderY - engine.camera.y,
            this.renderWidth, this.renderHeight);
            if (this.getPercentGrown() >= 1) {
                ctx.fillRect(this.renderX - engine.camera.x, this.renderY - engine.camera.y,
                    this.renderWidth, this.renderHeight);
            }
        }
    }
}
