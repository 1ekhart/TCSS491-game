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

        this.prompt = new OnScreenTextSystem(this, x + width/2, y - 10, `Press E to take order: ${order.id}`, false);
        engine.addEntity(this.prompt);
    }

    interact(player) {
        const availableStation = this.engine.stationManager.getAvailableStation();
        if (!availableStation) {
            console.log("No available cooking stations!");
            return;
        }
        availableStation.assignOrder(this.order);
        this.orderTaken = true;
        console.log(`Order assigned to station ${availableStation.id}`);

        this.prompt.removeFromWorld = true;
        this.removeFromWorld = true;
    }

    update(engine) {
        if (this.orderTaken) return;

        for (const layer of engine.entities) {
            for (const entity of layer) {
                if (entity instanceof Player && this.isCollidingWith(entity)) {
                    this.prompt.showText();
                    return;
                }
            }
        }
        this.prompt.hideText();
    }

    draw(ctx, engine) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(this.x - engine.camera.x, this.y - engine.camera.y, this.width, this.height);
    }
}