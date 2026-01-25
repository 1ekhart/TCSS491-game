import Inventory from "/js/Inventory.js";

const SLOT_SIZE = 32;
const PADDING = 5;
const BACKPACK_COLS = 5;
const BACKPACK_ROWS = 1;

export default class InventoryUI {
    constructor(player, ctx) {
        this.player = player;
        this.ctx = ctx;

        this.slotSize = SLOT_SIZE;
        this.padding = PADDING;
        this.hotbarY = ctx.canvas.height - this.slotSize - 10;

        this.backpackButtonX = 10;
        this.backpackButtonY = this.hotbarY;
        this.backpackButtonSize = this.slotSize;

        this.backpackX = 10;
        this.backpackY = this.hotbarY - (this.slotSize * 2) - 20;
        this.backpackCols = BACKPACK_COLS;
        this.backpackRows = BACKPACK_ROWS;

    }

    handleBackpackClick(click) {
        const x = click.x;
        const y = click.y;

        if (x >= this.backpackButtonX && x <= this.backpackButtonX + this.backpackButtonSize &&
            y >= this.backpackButtonY && y <= this.backpackButtonY + this.backpackButtonSize) {
            this.player.inventory.backpackOpen = !this.player.inventory.backpackOpen;
            console.log("Backpack:", this.player.inventory.backpackOpen ? "OPEN" : "CLOSED");
            return true; //clicked
        }
        return false;
    }

    draw() {
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
                    this.ctx.fillStyle = "#0f0";
                    this.ctx.fillRect(x + 4, y + 4, this.slotSize - 8, this.slotSize - 8);

                    this.ctx.fillStyle = "#fff";
                    this.ctx.font = "12px monospace";
                    this.ctx.fillText(slot.quantity, x + this.slotSize - 12, y + this.slotSize - 6);
                }
                this.ctx.strokeStyle = "#fff";
                this.ctx.strokeRect(x, y, this.slotSize, this.slotSize);
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
                // slot with item
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