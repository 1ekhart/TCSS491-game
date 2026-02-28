import { getItemData } from "./DataClasses/ItemList.js";
import Animator from "./GeneralUtils/Animator.js";
import Inventory from "/js/Inventory.js";
import { CONSTANTS } from "/js/Util.js";

const SLOT_SIZE = 32;
const PADDING = 5;
const DRAG_THRESHOLD = 5;
const CoinIconWidth = 24;
const HealthBarHeight = 18;

export default class InventoryUI {
    constructor(player, ctx) {
        this.player = player;
        this.ctx = ctx;

        this.slotSize = SLOT_SIZE;
        this.padding = PADDING;
        this.hotbarY = (ctx.canvas.height / CONSTANTS.SCALE) - this.slotSize - 10;
        this.coinInfoY = (ctx.canvas.height / CONSTANTS.SCALE) / 8
        this.healthInfoY = (ctx.canvas.height / CONSTANTS.SCALE) / 15

        this.backpackButtonX = 8;
        this.backpackButtonY = this.hotbarY - 2;
        this.backpackButtonSize = this.slotSize;

        this.backpackX = 10;
        this.backpackY = this.hotbarY - (this.slotSize * 2) - 20;
        this.backpackCols = Math.min(this.player.inventory.backpackSize, 6);
        this.backpackRows = Math.ceil(this.player.inventory.backpackSize / this.backpackCols);
        this.isHoveredBackpackButton = false;
        this.isHovered = false;

        this.mouseDownPos = null;
        this.draggedSlotIndex = null;
        this.isDragging = false;
        this.isVisible = true;

        const coinData = getItemData(1);
        this.backpackSprite = ASSET_MANAGER.getAsset("/Assets/Icons/backpack.png");
        this.moneySprite = new Animator(ASSET_MANAGER.getAsset("/Assets/Icons/CoinHeart.png"), coinData.spriteX, coinData.spriteY, coinData.width, coinData.height, 1, 1, 0, false, false);
        const heartData = getItemData(10);
        this.heartSprite = new Animator(ASSET_MANAGER.getAsset("/Assets/Icons/CoinHeart.png"), heartData.spriteX, heartData.spriteY, heartData.width, heartData.height, 1, 1, 0, false, false);
        this.maxHealthRect = (CONSTANTS.CANVAS_WIDTH / CONSTANTS.SCALE) / 4 // ttake up 1/4 of the screen
    }

    update(engine) {
        if (engine.mouse) {
            const x = engine.mouse.x / CONSTANTS.SCALE;
            const y = engine.mouse.y / CONSTANTS.SCALE;
            if (x >= this.backpackButtonX && x <= this.backpackButtonX + this.backpackButtonSize &&
            y >= this.backpackButtonY && y <= this.backpackButtonY + this.backpackButtonSize) {
                if (!this.isHoveredBackpackButton) {
                    this.isHoveredBackpackButton = true;
                    engine.setMouseSignal(1);
                }
            } else if (this.isHoveredBackpackButton) {
                this.isHoveredBackpackButton = false;
                engine.setMouseSignal(0);
            }

            if (engine.mouseDown) this.handleMouseDown(engine.mouseDown);
            if (engine.mouse) this.handleMouseMove(engine.mouse);
            if (engine.mouseUp) this.handleMouseUp(engine.mouseUp);

            engine.mouseDown = null;
            engine.mouseUp = null;
        }
    }

    getSlotName(slotIndex) {
        const slotData = this.player.inventory.slots[slotIndex];
        if (slotData.isDish) {
            let ingredientList = slotData.itemData.name + " (";
            for (let i = 0; i < slotData.ingredients.length - 1; i++) {
                ingredientList += getItemData(slotData.ingredients[i]).name + ", " 
            }
            ingredientList += getItemData(slotData.ingredients[slotData.ingredients.length - 1]).name + ")"
            return ingredientList;
        } else {
            return getItemData(slotData.itemID).name;
        }
    }

    handleBackpackClick(click) {
        const x = click.x / CONSTANTS.SCALE;
        const y = click.y / CONSTANTS.SCALE;

        if (x >= this.backpackButtonX && x <= this.backpackButtonX + this.backpackButtonSize &&
            y >= this.backpackButtonY && y <= this.backpackButtonY + this.backpackButtonSize) {
            this.player.inventory.backpackOpen = !this.player.inventory.backpackOpen;
            console.log("Backpack:", this.player.inventory.backpackOpen ? "OPEN" : "CLOSED");
            return true; //clicked
        }
        return false;
    }

    getSlotIndexAt(xClick, yClick) {
        // backpack slots
        if (this.player.inventory.backpackOpen) {
            const startIndex = this.player.inventory.hotbarSize;
            for (let i = 0; i < this.player.inventory.backpackSize; i++) {
                const col = i % this.backpackCols;
                const row = Math.floor(i / this.backpackCols);
                const x = this.backpackX + this.padding + col * (this.slotSize + this.padding);
                const y = this.backpackY + this.padding + row * (this.slotSize + this.padding);

                if (xClick >= x && xClick <= x + this.slotSize && yClick >= y && yClick <= y + this.slotSize) {
                    return startIndex + i;
                }
            }
        }
        // hotbar slots
        const hotbarStartX = this.backpackButtonSize + this.padding + 10;
        for (let i = 0; i < this.player.inventory.hotbarSize; i++) {
            const x = hotbarStartX + i * (this.slotSize + this.padding);
            const y = this.hotbarY;

            if (xClick >= x && xClick <= x + this.slotSize && yClick >= y && yClick <= y + this.slotSize) {
                return i;
            }
        }
        return null;
    }

    setVisibility(isVisible) {
        this.isVisible = isVisible;
    }


    handleMouseDown(click) {
        const x = click.x / CONSTANTS.SCALE;
        const y = click.y / CONSTANTS.SCALE;

        if (this.handleBackpackClick(click)) {
            return true;
        }

        const slotIndex = this.getSlotIndexAt(x, y);
        if (slotIndex !== null) {
            console.log(slotIndex)
            this.mouseDownPos = { x, y };
            this.draggedSlotIndex = slotIndex;
            this.isDragging = false;
            return true;
        }
        return false;
    }

    handleMouseMove(mouse) {
        const x = mouse.x / CONSTANTS.SCALE;
        const y = mouse.y / CONSTANTS.SCALE;
        const slotIndex = this.getSlotIndexAt(x, y);
        if (slotIndex !== null) {
            if (!this.isHovered && this.player.inventory.slots[slotIndex] !== null) {
            this.isHovered = true;
            engine.setMouseSignal(1);
            engine.getCursor().showText(this.getSlotName(slotIndex));
        }
        } else if (this.isHovered) {
            this.isHovered = false;
            engine.setMouseSignal(0);
            engine.getCursor().hideText();
        }
        if (!this.mouseDownPos || this.draggedSlotIndex === null) return;
        const dx = mouse.x / CONSTANTS.SCALE - this.mouseDownPos.x;
        const dy = mouse.y / CONSTANTS.SCALE - this.mouseDownPos.y;

        if (Math.hypot(dx, dy) > DRAG_THRESHOLD) {
            this.isDragging = true;
        }
    }

    handleMouseUp(click) {
        const x = click.x / CONSTANTS.SCALE;
        const y = click.y / CONSTANTS.SCALE;

        const targetSlotIndex = this.getSlotIndexAt(x, y);
        if (this.draggedSlotIndex !== null) {
            if (this.isDragging && targetSlotIndex !== null) {
                // drag -> move or swap
                this.player.inventory.moveOrSwap(this.draggedSlotIndex, targetSlotIndex);
            } else {
                // no drag -> regular click
                this.player.inventory.equipSlot(this.draggedSlotIndex);
            }
        }
        this.draggedSlotIndex = null;
        this.mouseDownPos = null;
        this.isDragging = false;
    }

    draw() {
        if (!this.isVisible) {
            return;
        }
        const hotbarStartX = this.backpackButtonSize + this.padding + 10;
        const hotbarSlots = this.player.inventory.slots.slice(0, this.player.inventory.hotbarSize);

        // backpack button
       const frameX = this.player.inventory.backpackOpen ? 32 : 0;
       this.ctx.drawImage(this.backpackSprite, frameX, 0, 32, 32, this.backpackButtonX, this.backpackButtonY, this.backpackButtonSize+5,this.backpackButtonSize+5);


        // draw money count:
        this.moneySprite.drawFramePlain(this.ctx, this.backpackButtonX/2, this.coinInfoY - 16, 1.5);
        this.ctx.save();
        this.ctx.font = "15px monospace";
        this.ctx.strokeStyle = "#00000049"
        this.ctx.fillStyle = "rgb(74, 40, 2)";
        this.ctx.strokeText(": $" + this.player.inventory.money, this.backpackButtonX/2 + CoinIconWidth, this.coinInfoY)
        this.ctx.fillText(": $" + this.player.inventory.money, this.backpackButtonX/2 + CoinIconWidth, this.coinInfoY)
        this.ctx.restore();

        // draw health:
        this.heartSprite.drawFramePlain(this.ctx, this.backpackButtonX/2, this.healthInfoY - 20, 1.5);
        this.ctx.fillStyle = "rgba(56, 1, 1, 0.51)"
        this.ctx.fillRect(this.backpackButtonX/2 + CoinIconWidth + 5, this.healthInfoY-HealthBarHeight, this.maxHealthRect, HealthBarHeight);
        this.ctx.fillStyle = "rgb(228, 78, 95)"
        this.ctx.fillRect(this.backpackButtonX/2 + CoinIconWidth + 5, this.healthInfoY-HealthBarHeight, this.maxHealthRect * (this.player.health / this.player.maxHealth), HealthBarHeight);
        
        
        // backpack
        if (this.player.inventory.backpackOpen) {
            const panelWidth = this.backpackCols * (this.slotSize + this.padding) + this.padding;
            const panelHeight = this.backpackRows * (this.slotSize + this.padding) + this.padding;

            // backpack background
            this.ctx.fillStyle = "rgba(88, 42, 18, 0.9)";
            this.ctx.fillRect(this.backpackX, this.backpackY, panelWidth, panelHeight);
            this.ctx.strokeStyle = "#fff";
            this.ctx.strokeRect(this.backpackX, this.backpackY, panelWidth, panelHeight);

            // slots
            const startIndex = this.player.inventory.hotbarSize;

            for (let i = 0; i < this.player.inventory.backpackSize; i++) {
                const slot = this.player.inventory.slots[startIndex + i];
                const col = i % this.backpackCols;
                const row = Math.floor(i / this.backpackCols);

                const x = this.backpackX + this.padding + col * (this.slotSize + this.padding);
                const y = this.backpackY + this.padding + row * (this.slotSize + this.padding);

                this.ctx.fillStyle = "#222";
                this.ctx.fillRect(x, y, this.slotSize, this.slotSize);

                if (slot) {
                if (!slot.itemData) {
                    slot.itemData = getItemData(slot.itemID);
                    if (slot.itemData) {
                    slot.sprite = new Animator(ASSET_MANAGER.getAsset(slot.itemData.assetName), 
                    slot.itemData.spriteX, slot.itemData.spriteY, slot.itemData.width, slot.itemData.height, 1, 1, 0);
                    }
                }
                if (slot.itemData) {
                    if (!slot.sprite.drawFramePlain) {slot.sprite = new Animator(ASSET_MANAGER.getAsset(slot.itemData.assetName), 
                        slot.itemData.spriteX, slot.itemData.spriteY, slot.itemData.width, slot.itemData.height, 1, 1, 0);}
                    slot.sprite.drawFramePlain(this.ctx, x, y, slot.itemData.scale * (this.slotSize / slot.itemData.width));
                } else {
                    this.ctx.fillStyle = "#0f0";
                    this.ctx.fillRect(x + 4, y + 4, this.slotSize - 8, this.slotSize - 8);
                }


                    this.ctx.fillStyle = "#fff";
                    this.ctx.font = "12px monospace";
                    this.ctx.fillText(slot.quantity, x + this.slotSize - 12, y + this.slotSize - 6);
                }

                const slotIndex = startIndex + i;
                const isEquipped = slotIndex === this.player.inventory.equippedSlot;

                this.ctx.strokeStyle = isEquipped ? "#ffd700" : "#fff"; //yellow if equipped
                this.ctx.lineWidth = isEquipped ? 3 : 1;
                this.ctx.strokeRect(x, y, this.slotSize, this.slotSize);
                this.ctx.lineWidth = 1;
            }
        }

        // hotbar slots
        for (let i = 0; i < hotbarSlots.length; i++) {
            const slot = hotbarSlots[i];
            const x = hotbarStartX + i * (this.slotSize + this.padding);
            const y = this.hotbarY;

            // empty slot
            this.ctx.fillStyle = "#222";
            this.ctx.fillRect(x, y, this.slotSize, this.slotSize);

            if (slot) {
                if (!slot.itemData) {
                    slot.itemData = getItemData(slot.itemID);
                    if (slot.itemData) {
                        slot.sprite = new Animator(ASSET_MANAGER.getAsset(slot.itemData.assetName), 
                        slot.itemData.spriteX, slot.itemData.spriteY, slot.itemData.width, slot.itemData.height, 1, 1, 0);
                    }
                }
                if (slot.itemData) {
                    if (!slot.sprite.drawFramePlain) {slot.sprite = new Animator(ASSET_MANAGER.getAsset(slot.itemData.assetName), 
                        slot.itemData.spriteX, slot.itemData.spriteY, slot.itemData.width, slot.itemData.height, 1, 1, 0);}
                    slot.sprite.drawFramePlain(this.ctx, x, y, slot.itemData.scale * (this.slotSize / slot.itemData.width));
                } else {
                    this.ctx.fillStyle = "#0f0";
                    this.ctx.fillRect(x + 4, y + 4, this.slotSize - 8, this.slotSize - 8);
                }


                // quantity of item
                this.ctx.fillStyle = "#fff";
                this.ctx.font = "14px monospace";
                const txtMetrics = this.ctx.measureText(slot.quantity);
                this.ctx.fillText(slot.quantity, x + this.slotSize - txtMetrics.width, y + this.slotSize - 6);
            }

            const slotIndex = i;
            const isEquipped = slotIndex === this.player.inventory.equippedSlot;

            this.ctx.strokeStyle = isEquipped ? "#ffd700" : "#fff"; //yellow if equipped
            this.ctx.lineWidth = isEquipped ? 3 : 1;
            this.ctx.strokeRect(x, y, this.slotSize, this.slotSize);
            this.ctx.lineWidth = 1;
        }
    }
}