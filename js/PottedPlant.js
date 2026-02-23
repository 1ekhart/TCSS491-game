import EntityInteractable from "/js/AbstractClasses/EntityInteractable.js";
import Animator from "/js/GeneralUtils/Animator.js";
import OnScreenTextSystem from "/js/GeneralUtils/OnScreenText.js";
import DialogueBox from "/js/GeneralUtils/DialogueBox.js";
import Item from "/js/Item.js";
import Player from "/js/Player.js";
import { CONSTANTS, randomInt, randomIntRange } from "/js/Util.js";
import { getPlantData } from "./DataClasses/Plants.js";

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
        this.dayPlaced = dayPlaced;
        this.interactCooldown = 0;

        // get the area where the pot is rendered
        this.renderX = x;
        this.renderY = y +5;
        this.renderWidth = width;
        this.renderHeight = height;
        if(plantID !== false) {
            this.initializePlant(plantID);
        } else {
            this.plant = false; // empty pot
        }
        this.prompt = new OnScreenTextSystem(this,
                    x + (width / 4), y - (height) - (height/4), `${this.plant.name} in day ${Math.floor(this.plant.growTime + dayPlaced / engine.clock.dayCount)}`, false);
        engine.addEntity(this.prompt);
        this.potSprite = new Animator(ASSET_MANAGER.getAsset("/Assets/WorldItems/grey-pot.png"), 0, 0, 32, 32, 1, 1, 0, false, false);
    }

    save(saveObj) {
        let plant;
        if (this.plant) {
            plant = this.plant.itemID
        } else {
            plant = false;
        }
        let data = {
            type: "PottedPlant",
            level: 2,
            plant: plant,
            x: this.renderX,
            y: this.renderY - 5,
            width: this.renderWidth,
            height: this.renderHeight,
            dayPlaced: this.dayPlaced
        }
        saveObj.setEntity(data);
        console.log(data)
    }

    initializePlant(plantID) {
        this.plant = getPlantData(plantID);
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
        if(!this.plant) return 0;
        return engine.getClock().dayCount / (this.dayPlaced + this.plant.growTime);
    }

    update(engine) {
        const newText = this.plant ? `${this.plant.name} in ${Math.max(0,((this.plant.growTime) + this.dayPlaced) - (engine.clock.dayCount))} days` : "Empty"
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
        if(this.interactCooldown > 0) {
            this.interactCooldown -= 1;
        }
    }

    /** @param {Player} player */
    interact(player) {
        if(this.interactCooldown > 0) {
            return;
        }
        this.interactCooldown = 60;

        // planting
        if(!this.plant) {
            const equippedItemID = player.inventory.getEquippedItem()
            if(getPlantData(equippedItemID)) {
                this.initializePlant(equippedItemID)
                player.inventory.removeItem(player.inventory.getEquippedSlot())
            } else {
                this.engine.addUIEntity(new DialogueBox(this.engine, "Select a vegetable item to plant it", false, false))
            }
        }

        // harvesting
        if (this.getPercentGrown() >= 1) {
            this.dayPlaced = this.engine.clock.dayCount;
            console.log("Interacted!")
            this.engine.addEntity(
                new Item(this.plant.itemID,
                    this.renderX + (this.width / 4), this.renderY - (this.height / 2),
                    randomIntRange(10, -10), -5,
                    randomIntRange(3, 5))
            )
            if (this.plant.regrows == true) {
                this.dayPlaced = this.engine.clock.dayCount;
            }
        }
    }

    draw(ctx, engine) {
        this.potSprite.drawFramePlain(ctx, this.renderX - engine.camera.x, this.renderY - engine.camera.y, 1)

        if(!this.plant) return;

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
