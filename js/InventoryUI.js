import Inventory from "/js/Inventory.js";

const SLOT_SIZE = 32;
const PADDING = 5;

export default class InventoryUI {
    constructor(player, ctx) {
        this.player = player;
        this.ctx = ctx;
        this.slotSize = SLOT_SIZE;
        this.padding = PADDING;
        this.hotbarY = ctx.canvas.height - this.slotSize - 10;
    }

    draw() {
        const hotbarSlots = this.player.inventory.slots.slice(0, this.player.inventory.hotbarSize);

        for (let i = 0; i < hotbarSlots.length; i++) {
            const slot = hotbarSlots[i];
            const x = 10 + i * (this.slotSize + this.padding);
            const y = this.hotbarY;

            // empty slot color
            this.ctx.fillStyle = "#222";
            this.ctx.fillRect(x, y, this.slotSize, this.slotSize);

            if (slot) {
                // slot color with item
                this.ctx.fillStyle = "#0f0";
                this.ctx.fillRect(x + 4, y + 4, this.slotSize - 8, this.slotSize - 8);

                // quantity of item
                this.ctx.fillStyle = "#fff";
                this.ctx.font = "14px monospace";
                this.ctx.fillText(slot.quantity, x + this.slotSize - 12, y + this.slotSize - 6);
            }
            this.ctx.strokeStyle = "#fff";
            this.ctx.strokeRect(x, y, this.slotSize, this.slotSize);
        }

    }
}