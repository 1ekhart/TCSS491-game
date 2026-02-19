import { getItemData } from "./DataClasses/ItemList.js";
import Animator from "./GeneralUtils/Animator.js";
import Inventory from "/js/Inventory.js";
import { CONSTANTS } from "/js/Util.js";

const SLOT_SIZE = 32;
const PADDING = 5;
const DRAG_THRESHOLD = 5;

export default class InventoryUI {
    constructor(player, ctx) {
        this.player = player;
        this.ctx = ctx;

        this.slotSize = SLOT_SIZE;
        this.padding = PADDING;
        this.hotbarY = (ctx.canvas.height / CONSTANTS.SCALE) - this.slotSize - 10;
        this.coinInfoY = (ctx.canvas.height / CONSTANTS.SCALE) / 4

        this.backpackButtonX = 10;
        this.backpackButtonY = this.hotbarY;
        this.backpackButtonSize = this.slotSize;

        this.backpackX = 10;
        this.backpackY = this.hotbarY - (this.slotSize * 2) - 20;
        this.backpackCols = Math.min(this.player.inventory.backpackSize, 5);
        this.backpackRows = Math.ceil(this.player.inventory.backpackSize / this.backpackCols);
        this.isHovered = false;

        this.mouseDownPos = null;
        this.draggedSlotIndex = null;
        this.isDragging = false;
        this.isVisible = true;
    }

    update(engine) {
        if (engine.mouse) {
            const x = engine.mouse.x / CONSTANTS.SCALE;
            const y = engine.mouse.y / CONSTANTS.SCALE;
            if (x >= this.backpackButtonX && x <= this.backpackButtonX + this.backpackButtonSize &&
            y >= this.backpackButtonY && y <= this.backpackButtonY + this.backpackButtonSize) {
                if (!this.isHovered) {
                    this.isHovered = true;
                    engine.setMouseSignal(1);
                }
            } else if (this.isHovered) {
                this.isHovered = false;
                engine.setMouseSignal(0);
            }

            if (engine.mouseDown) this.handleMouseDown(engine.mouseDown);
            if (engine.mouse) this.handleMouseMove(engine.mouse);
            if (engine.mouseUp) this.handleMouseUp(engine.mouseUp);

            engine.mouseDown = null;
            engine.mouseUp = null;
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
        this.ctx.fillStyle = this.player.inventory.backpackOpen ? "#420D09" : "#960019";
        this.ctx.fillRect(this.backpackButtonX, this.backpackButtonY, this.backpackButtonSize, this.backpackButtonSize);
        this.ctx.strokeStyle = "#fff";
        this.ctx.strokeRect(this.backpackButtonX, this.backpackButtonY, this.backpackButtonSize, this.backpackButtonSize);
        this.ctx.fillStyle = "#fff";
        this.ctx.font = "12px monospace";
        this.ctx.fillText("B", this.backpackButtonX + 13, this.backpackButtonY + 20);

        // draw money count:
        this.ctx.save();
        this.ctx.font = "15px monospace";
        this.ctx.strokeStyle = "#00000049"
        this.ctx.fillStyle = "rgb(74, 40, 2)";
        this.ctx.strokeText("Money: $" + this.player.inventory.money, this.backpackButtonX, this.coinInfoY)
        this.ctx.fillText("Money: $" + this.player.inventory.money, this.backpackButtonX, this.coinInfoY)
        this.ctx.restore();
        
        
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
                    slot.sprite = new Animator(ASSET_MANAGER.getAsset(slot.itemData.assetName), 0, 0, slot.itemData.width, slot.itemData.height, 1, 1, 0);
                    }
                }
                if (slot.itemData) {
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
                        slot.sprite = new Animator(ASSET_MANAGER.getAsset(slot.itemData.assetName), 0, 0, slot.itemData.width, slot.itemData.height, 1, 1, 0);
                    }
                }
                if (slot.itemData) {
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