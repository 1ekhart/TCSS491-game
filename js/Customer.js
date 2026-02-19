import EntityInteractable from "/js/AbstractClasses/EntityInteractable.js";
import OnScreenTextSystem from "/js/GeneralUtils/OnScreenText.js";
import Player from "/js/Player.js";

export default class Customer extends EntityInteractable {
    constructor(x, y, width, height, order, engine) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.engine = engine;

        this.order = order;
        this.orderTaken = false;
        this.orderCompleted = false;
        this.prompt = new OnScreenTextSystem(this, x + width/2, y - 10, `Press E to take order: ${order.id}`, false);
    }

    interact(player) {
        if(this.orderCompleted) return;
        // if order not taken yet -> take it
        if (!this.orderTaken) {
            const availableStation = this.engine.stationManager.getAvailableStation();
            if (!availableStation) {
                console.log("No available cooking stations!");
                return;
            }
            availableStation.assignOrder(this.order);
            this.orderTaken = true;
            this.prompt.changeText(`Order taken! Bring: ${this.order.id}`);
            this.prompt.showText();
            console.log(`Order taken! Order assigned to station ${availableStation.id}`);
            return;
        }

        // if order already taken -> try delivering
        if (this.orderTaken && !this.orderCompleted) {
            const equippedItem = player.inventory.getEquippedItem();

            if (equippedItem === this.order.id) {
                player.inventory.removeItem(player.inventory.equippedSlot);

                this.orderCompleted = true;

                if (this.prompt) {
                    this.prompt.removeFromWorld = true;
                    this.prompt = null;
                }

                this.removeFromWorld = true;

                if (this.onComplete) {
                    this.onComplete();
                }

                console.log("Order delivered!");
            } else {
                console.log("This is not my order!");
            }
        }
    }

    update(engine) {
        /**if (this.orderTaken) return;

        if (this.orderCompleted && this.prompt) {
            this.prompt.removeFromWorld = true;
            this.prompt = null;
        }

        for (const layer of engine.entities) {
            for (const entity of layer) {
                if (entity instanceof Player && this.isCollidingWith(entity)) {
                    this.prompt.showText();
                    return;
                }
            }
        }
        this.prompt.hideText();**/

        if (this.orderCompleted) {
            if (this.prompt) {
                this.prompt.removeFromWorld = true;
                this.prompt = null;
            }
            return;
        }

        if (this.orderTaken) {
            this.prompt.changeText(`Order taken! Bring: ${this.order.id}`);
        } else {
            this.prompt.changeText(`Press E to take order: ${this.order.id}`);
        }

        let playerNearby = false;
        for (const layer of engine.entities) {
            for (const entity of layer) {
                if (entity instanceof Player && this.isCollidingWith(entity)) {
                    playerNearby = true;
                    break;
                }
            }
            if (playerNearby) break;
        }

        if (playerNearby) {
            this.prompt.showText();
        } else {
            this.prompt.hideText();
        }
    }

    draw(ctx, engine) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(this.x - engine.camera.x, this.y - engine.camera.y, this.width, this.height);
    }
}