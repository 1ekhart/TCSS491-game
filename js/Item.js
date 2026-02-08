/** @import GameEngine from "/js/GameEngine.js" */
import WorldEntity from '/js/AbstractClasses/WorldEntity.js';
import { getItemData } from '/js/DataClasses/ItemList.js';
import Animator from '/js/GeneralUtils/Animator.js';
import Player from '/js/Player.js';
import { CONSTANTS } from '/js/Util.js';

const HITBOX_WIDTH = 16;
const HITBOX_HEIGHT = 16;
const PICKUP_COOLDOWN = 1; // the item can't be picked up for this amount of time;
const DRAG = 1;
const GRAVITY = 1;

export default class Item extends WorldEntity {
    constructor(itemID, x, y, initVelocityX, initVelocityY, quantity) {
        super();
        this.x = x;
        this.y = y;
        this.width = HITBOX_WIDTH;
        this.height = HITBOX_HEIGHT;
        this.itemID = itemID;
        this.pickable = false;
        this.elapsedTime = 0;

        if (!initVelocityX) {
            this.xVelocity = 0;
        } else {
        this.xVelocity = initVelocityX;
        }
        if (!initVelocityY) {
            this.yVelocity =  0;
        } else {
        this.yVelocity = initVelocityY;
        }
        if (!quantity) {
            this.quantity = 1;
        } else {
            this.quantity = quantity;
        }

        // Initialize the sprite and other item data.
        this.itemData = getItemData(itemID);
        if (this.itemData) {
            this.sprite = new Animator(ASSET_MANAGER.getAsset(this.itemData.assetName), 0, 0, 32, 32, 1, 1, 0);
        }
    }

    getSprite() {
        if (itemData) {
            return this.sprite;
        }
    }

    update(engine) {
        if (this.xVelocity > 0) {
            this.xVelocity -= DRAG;
        } if (this.xVelocity < 0) {
            this.xVelocity += DRAG;
        }

        this.yVelocity += GRAVITY;

        this.moveColliding(engine);

        // do the timer for when the item's able to be picked up.
        if (this.pickable == false) {
            this.elapsedTime += CONSTANTS.TICK_TIME;
            if (this.elapsedTime >= PICKUP_COOLDOWN) {
                this.pickable = true;
            }
        }

        if (this.pickable == true) {
            if (!engine.entities[4]) return;
            for (const entity of engine.entities[4]) {
                if (entity instanceof Player) {
                    if (this.isCollidingWith(entity)) {
                        this.pickUpItem(entity);
                    }
                }
            }
        }
    }

    pickUpItem(player) {
        if (player.inventory.addItem({itemID: this.itemID, quantity: this.quantity})) {
            console.log("Player picked up item " + this.itemID);
            this.removeFromWorld = true;
        } else {
            console.log("Inventory full, cannot pick up item");
        }
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {GameEngine} engine
     */
    draw(ctx, engine) {
        // draw *something* if a subclass doesn't correctly draw anything
        if (this.pickable == false) {
        ctx.strokeStyle = "#ff00ff45"
        ctx.fillStyle = "#ff00ff45"
        } else {
        ctx.strokeStyle = "#ff00ff"
        ctx.fillStyle = "#ff00ff"
        }
        if (CONSTANTS.DEBUG) {
            ctx.strokeRect(this.x - engine.camera.x, this.y - engine.camera.y, HITBOX_WIDTH, HITBOX_HEIGHT);
        }
        if (this.itemData) { // if a valid item draw the sprite, otherwise give a plain rectangle
            this.sprite.drawFramePlain(ctx, this.x - (this.itemData.width / 4) - engine.camera.x, 
            this.y - (this.itemData.height / 4) - engine.camera.y, 
            this.itemData.scale, 0);
        } else {
            ctx.fillRect(this.x - engine.camera.x, this.y - engine.camera.y, HITBOX_WIDTH, HITBOX_HEIGHT);
        }
    }
}
