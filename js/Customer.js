import EntityInteractable from "/js/AbstractClasses/EntityInteractable.js";
import Animator from "/js/GeneralUtils/Animator.js";
import { getItemData } from "/js/DataClasses/ItemList.js";
import { getRecipeData } from "/js/DataClasses/RecipeList.js";
import DialogueBox from "/js/GeneralUtils/DialogueBox.js";
import OnScreenTextSystem from "/js/GeneralUtils/OnScreenText.js";
import Player from "/js/Player.js";
import { CONSTANTS, secondsToTicks } from "/js/Util.js";

const INTERACTION_COOLDOWN = secondsToTicks(0.5);
const WAIT_TIME = secondsToTicks(25);
const ANGRY_DURATION = secondsToTicks(1);
const COMPLETE_DURATION = secondsToTicks(1);

export default class Customer extends EntityInteractable {
    constructor(x, y, width, height, order, engine) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.engine = engine;

        this.order = order;
        this.recipeID = order.recipeID;
        this.recipeItemID = getRecipeData(this.recipeID).itemID
        this.recipeName = getItemData(this.recipeItemID).name;
        if (order.specificIngredient) {
            this.ingredientID = order.specificIngredient;
            this.ingredientName = getItemData(this.ingredientID).name;
            // this.text = `${this.recipeName} with ${this.ingredientName}`;
        } else {
            // this.text = `${this.recipeName}`;
        }
        this.text = "Press E to take order or F to refuse"
        this.orderTaken = false;
        this.orderCompleted = false;
        this.availableStation = null;
        this.text = `Press E to take order: ${this.recipeName} with ${this.ingredientNames}`;
        //this.interactionCooldown = interactionCooldown;
        console.log(this.text);
        this.interactionCooldown = INTERACTION_COOLDOWN;
        this.prompt = new OnScreenTextSystem(this, x + width/2, y - 2, `${this.text}`, false);

        //this.waitTime = WAIT_TIME; // testing
        this.remainingTicks = WAIT_TIME;
        //this.remainingTime = this.waitTime;
        this.timerDisplay = new OnScreenTextSystem(this, x + width / 2 + 10, y - 22, this.formatTime(this.remainingTicks), false);
        
        // ran out of time
        this.isAngry = false;
        this.angryDuration = 1.0;
        this.angryTimer = 0;

        // completed order
        this.isComplete = false;
        this.completeDuration = COMPLETE_DURATION;
        this.completeTimer = 0;

        // sprite chat bubble
        this.chatBubbleSprite = new Animator(ASSET_MANAGER.getAsset("/Assets/Icons/OrderBubble.png"), 0, 0, 32, 34, 1, 1, 0);
        this.pendingBubbleSprite = new Animator(ASSET_MANAGER.getAsset("/Assets/Icons/PendingOrder.png"), 0, 0, 32, 34, 1, 1, 0);
        this.angryBubbleSprite = new Animator(ASSET_MANAGER.getAsset("/Assets/Icons/AngryOrder.png"), 0, 0, 32, 34, 1, 1, 0);
        this.completeBubbleSprite = new Animator(ASSET_MANAGER.getAsset("/Assets/Icons/CompleteOrder.png"), 0, 0, 32, 34, 1, 1, 0);

        // sprite dish
        this.dishSprite = new Animator(ASSET_MANAGER.getAsset(getItemData(this.recipeItemID).assetName), 0, 0, getItemData(this.recipeItemID).width, getItemData(this.recipeItemID).height, 1, 1, 0);

        this.customerFrame = Math.floor(Math.random() * 6);
        this.customerSprite = new Animator(ASSET_MANAGER.getAsset("/Assets/Entities/Customers.png"), 0, 0, 32, 32, 1, 1, 0, false, false);
    }

    interact(player) {
        if(this.orderCompleted) return;
        if (this.interactionCooldown > 0) return;
        this.interactionCooldown = INTERACTION_COOLDOWN;
        // if order not taken yet -> take it
        if (!this.orderTaken) {
            //const availableStation = this.engine.stationManager.getAvailableStation();
            this.availableStation = this.engine.stationManager.getAvailableStation();
            if (!this.availableStation) {
                console.log("No available cooking stations!");
                return;
            }
            this.availableStation.assignOrder(this.order);
            this.orderTaken = true;
            this.prompt.changeText(`Order taken! Bring: ${this.recipeName} with ${this.ingredientNames}`);
            this.prompt.showText();

            this.timerDisplay.showText();
            this.timerDisplay.changeText(this.formatTime(this.remainingTicks));

            // console.log(`Order taken! Order assigned to station ${availableStation.id}`);
            return;
        }

        // if order already taken -> try delivering
        if (this.orderTaken && !this.orderCompleted) {
            const equippedItem = player.inventory.getEquippedItem();
            const playerInventory = player.inventory;

            if (equippedItem == this.recipeItemID && playerInventory.slots[playerInventory.getEquippedSlot()].isDish) { // check if the idno matches then do an additional check if the ingredient is there
                
                const dishIngredients = playerInventory.slots[playerInventory.getEquippedSlot()].ingredients;
                const orderIngredients = this.order.ingredients;
                const match = orderIngredients.every(id => dishIngredients.includes(id));
                if (!match) {
                    this.engine.addUIEntity(new DialogueBox(this.engine, "This is the right dish but with the wrong ingredients!", false, false));
                    return;
                }
                /*
                if (!playerInventory.slots[playerInventory.getEquippedSlot()].ingredients.includes(this.ingredientID)) {
                    this.engine.addUIEntity(new DialogueBox(this.engine, "This is the right dish but with the wrong ingredients!", false, false))
                    return;
                }*/
                player.inventory.money += this.calculateMoney(player, playerInventory.getEquippedSlot());
                player.inventory.removeItem(player.inventory.equippedSlot);
                this.orderCompleted = true;

                // if (this.prompt) {
                //     this.prompt.removeFromWorld = true;
                //     this.prompt = null;
                // }


                //this.removeFromWorld = true;
                this.isComplete = true;
                this.completeTimer = this.completeDuration;
                this.timerDisplay.removeFromWorld = true;
                this.prompt.removeFromWorld = true;

                console.log("Order delivered!");
            } else {
                this.engine.addUIEntity(new DialogueBox(this.engine, "Wrong item given, select the correct dish in your inventory.", false, false))
                console.log("This is not my order!");
            }
        }
    }

    refuseOrder(player) {
        // if (this.orderTaken) {return;}
        this.removeFromWorld = true;
        if (this.availableStation != null) this.availableStation.reset();
        if (this.onComplete) this.onComplete();
    }

    formatTime(ticks) {
        if (typeof ticks !== "number" || isNaN(ticks) || ticks < 0) ticks = 0;
       return Math.ceil(ticks / CONSTANTS.TICKS_PER_SECOND) + "s"
    }

    calculateMoney(player, equippedIndex) {
        const playerInventory = player.inventory;
        const itemSaleValue = getItemData(playerInventory.slots[equippedIndex].itemID).sellPrice;
        let totalCost = itemSaleValue;
        const ingredients = player.inventory.slots[equippedIndex].ingredients;
        for (let i = 0; i < ingredients.length; i++) {
            totalCost += getItemData(ingredients[i]).sellPrice;
        }
        return totalCost * 1.2;
    }

    update(engine) {
        if(this.interactionCooldown > 0) this.interactionCooldown -= 1;

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

        if (this.isComplete) {
            this.completeTimer -= 1;
            if (this.completeTimer <= 0) {
                this.removeFromWorld = true;
                this.prompt.removeFromWorld = true;
                this.timerDisplay.removeFromWorld = true;
                if(this.availableStation != null) {
                    this.availableStation.reset();
                }
                if (this.onComplete) {
                    this.onComplete();
                }
            }
        }

        if (this.orderTaken && !this.orderCompleted) {
            this.remainingTicks -= 1;
            if (this.remainingTicks <= 0 && !this.isAngry) {
                this.isAngry = true;
                this.angryTicks = ANGRY_DURATION;
                this.timerDisplay.removeFromWorld = true;
                this.remainingTicks = 0;
            }
            if (this.isAngry) {
                this.angryTicks -= 1;
                if (this.angryTicks <= 0) {
                    this.removeFromWorld = true;
                    this.timerDisplay.removeFromWorld = true;
                    // reset station when customer leaves
                    if(this.availableStation != null) {
                        this.availableStation.reset();
                    }

                    if (this.onComplete) this.onComplete();
                    console.log("Customer left due to timeout!");
                }
            } else {
                this.timerDisplay.changeText(this.formatTime(this.remainingTicks));
            }
        }
    }

    draw(ctx, engine) {
        if (engine.getLevel().currentLevel !== 3) return;
        //ctx.fillStyle = "#000000";
        //ctx.fillRect(this.x - engine.camera.x, this.y - engine.camera.y, this.width, this.height);
        this.customerSprite.drawFramePlain(ctx, this.x - engine.camera.x - 10, this.y - engine.camera.y - 8, 2, this.customerFrame);

        // chat bubble
        const bubbleX = this.x + this.width / 2 - 16 - engine.camera.x + 10;
        const bubbleY = this.y - 42 - engine.camera.y;
        let bubbleToDraw;
        if (this.isAngry) {
            bubbleToDraw = this.angryBubbleSprite;
        } else if (this.isComplete) {
            bubbleToDraw = this.completeBubbleSprite;
        } else if (this.orderTaken) {
            bubbleToDraw = this.pendingBubbleSprite;
        } else {
            bubbleToDraw = this.chatBubbleSprite;
        }
        bubbleToDraw.drawFramePlain(ctx, bubbleX, bubbleY, 1);

        // dish
        const dishScale = 20 / getItemData(this.recipeItemID).width;
        //const dishScale = 20 / getItemData(this.recipeItemID).width;
        const dishX = bubbleX + (32 - 20) / 2;
        const dishY = bubbleY + (32 - 20) / 2;
        if (!this.isAngry && !this.isComplete) {
            this.dishSprite.drawFramePlain(ctx, dishX, dishY, dishScale);
        }
    }
}
