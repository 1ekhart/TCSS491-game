import EntityInteractable from './AbstractClasses/EntityInteractable.js';
import BoundingBox from './GeneralUtils/BoundingBox.js';

export default class Interactable extends EntityInteractable {
    constructor(x, y, width, height) {
        super();
        Object.assign(this, { x, y, width, height })
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.BB = new BoundingBox(this.x, this.y, this.width, this.height);
        this.color = "#c3ce94";
        this.updateBB();
        this.toggleCooldown = 1; // 1 second cooldown
        this.elapsedTime = 0;

        this.toggleable = true;

        this.toggleState = false;
    }

    /**
    * @param {import('/js/GameEngine.js').default} engine
    */
    update(engine) {
        if (this.toggleable == false) {
            this.elapsedTime += engine.getTickSpeed();
            if (this.elapsedTime > this.toggleCooldown) {
                this.toggleable = true;
                this.elapsedTime = 0;
            }
        }

    }

    updateBB() {
        this.BB = new BoundingBox(this.x, this.y, this.width, this.height);
    }

    handleInteraction() {
        if (this.toggleable == true) {
            this.toggleable = false;
            if (this.toggleState == true) {
                this.unToggleEntity();
            } else {
                this.toggleEntity();
            }
        }
    }

    toggleEntity() {
        this.toggleState = true;
        this.color = "#7086f1";
        console.log("Toggled!")
    }

    unToggleEntity() {
        this.toggleState = false;
        this.color = "#c3ce94";
        console.log("UnToggled!")
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {import('/js/GameEngine.js').default} engine
     */
    draw(ctx, engine) {
        // draw *something* if a subclass doesn't correctly draw anything
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
