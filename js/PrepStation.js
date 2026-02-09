import EntityInteractable from "/js/AbstractClasses/EntityInteractable.js";
import OnScreenTextSystem from "/js/GeneralUtils/OnScreenText.js";
import Player from "/js/Player.js";
import { CONSTANTS } from "/js/Util.js";
import { STATION_STATE } from "/js/Constants/cookingStationStates.js";

const idleColor = "#7D7F7C";
const assemblingColor = "#FFA500";
const doneColor = "#90EE90";

export default class PrepStation extends EntityInteractable {
    constructor(x, y, width, height, station, engine) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.station = station;
        this.engine = engine;

        this.color = idleColor;
        this.toggleState = false;
        this.toggleable = true;

        this.assemblyTime = 240; // fixed time per ingredient for now : 4 sec
        this.prompt = new OnScreenTextSystem(this, (this.x + width / 2), (this.y - height / 4), "Press E to Assemble", false);
        this.ingredientText = new OnScreenTextSystem(this, (this.x + width / 2), (this.y - height / 2 - 10), "", false)
        this.timer = new OnScreenTextSystem(this, (this.x + width / 2), (this.y - height / 4), "0.0" + Math.ceil(this.assemblyTime / 60), false);

        this.ingredients = [];
        this.currentIngredientIndex = 0;
        this.elapsedTime = 0;

        engine.addEntity(this.prompt);
        engine.addEntity(this.timer);
        engine.addEntity(this.ingredientText);
    }

    startAssemblyForOrder(order) {
        this.ingredients = order.ingredients;
        this.currentIngredientIndex = 0;
        this.elapsedTime = 0;

        this.assemblyTime = order.assembleTime || 240;
        this.station.startAssembly(this.ingredients.length);
    }

    update(engine) {
        if (!this.toggleState) {
            this.timer.hideText();
            this.ingredientText.hideText();
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
        } else {

            this.prompt.hideText();
            this.timer.showText();

            const currentIngredient = this.ingredients[this.currentIngredientIndex];
            this.ingredientText.showText();
            this.ingredientText.changeText(currentIngredient);

            this.elapsedTime++;
            let remaining = Math.max(0, this.assemblyTime - this.elapsedTime);
            this.timer.changeText("0:" + Math.ceil(remaining / 60));

            if (this.elapsedTime >= this.assemblyTime) {
                this.elapsedTime = 0;
                this.station.completeAssemblyStep();
                this.currentIngredientIndex++;

               if (this.station.isComplete()) {
                this.toggleState = false;
                this.toggleable = true;
                this.color = doneColor;
                this.ingredientText.hideText();
                this.prompt.changeText("Press E to collect");
               }
            }
        }
    }

    interact(player) {
        if (this.station.isComplete()) {
            const success = player.inventory.addItem({ itemID: this.station.currentOrder, quantity: 1});

            if (!success) {
                console.log("Inventory is full!");
                return;
            }

            console.log("Collected", this.station.currentOrder.id);
            this.station.reset();
            this.color = idleColor;
            this.toggleState = false;
            this.toggleable = true;
            this.prompt.changeText("Press E to Assemble");
            return;
        }
        if (this.toggleable && this.station.canStartAssembly()) {
            this.toggleState = true;
            this.color = assemblingColor;

            this.ingredients = this.station.ingredients;
            this.currentIngredientIndex = 0;
            this.station.startAssembly(this.ingredients.length);
        }
        if (!this.station.canStartAssembly() && this.station.state !== STATION_STATE.ASSEMBLING) {
            console.log("Cannot start assembling yet!");
        }
    }

    draw(ctx, engine) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - engine.camera.x, this.y - engine.camera.y, this.width, this.height);
        if (engine.CONSTRAINTS?.DEBUG) {
            ctx.strokeStyle = "#AA0000";
            ctx.strokeRect(this.x - engine.camera.x, this.y - engine.camera.y, this.width, this.height);
        }
    }
}
