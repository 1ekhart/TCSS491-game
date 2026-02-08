// hotbar # of slots
const HOTBAR_SIZE = 2;

// backpack # of slots
const BACKPACK_SIZE = 1;

export default class Inventory {
    constructor() {
        this.hotbarSize = HOTBAR_SIZE;
        this.backpackSize = BACKPACK_SIZE;
        this.totalSlots = HOTBAR_SIZE + BACKPACK_SIZE;

        // each slot is either null or {itemID, quantity}
        this.slots = new Array(this.totalSlots).fill(null);
        this.backpackOpen = false;

        // selected/equipped slot
        this.equippedSlot = null;
    }

    hasItem(itemID) { // return the inventory space if the item is in the inventory
        for (let i = 0; i < this.totalSlots; i++) {
            if (this.slots[i] && this.slots[i].itemID === itemID) {
                return i; 
            }
        }
    }

    addItem(item) {
        // if item already exists, increment
        for (let i = 0; i < this.totalSlots; i++) {
            if (this.slots[i] && this.slots[i].itemID === item.itemID) {
                this.slots[i].quantity += item.quantity;
                console.log("Added to exisitng item");
                return true;
            }
        }
        // otherwise check hotbar first for empty slot
        let index = this.findEmptySlot(0, this.hotbarSize);
        if (index !== -1) {
            this.slots[index] = item;
            console.log("Item added to hotbar");
            return true;
        }

        // then try backpack
        index = this.findEmptySlot(this.hotbarSize, this.totalSlots);
        if (index !== -1) {
            this.slots[index] = item;
            console.log("Item added to backpack");
            return true;
        }

        // failed: inventory full
        console.log("Inventory full!");
        return false;
    }

    removeItem(slotIndex) {
        const slot = this.slots[slotIndex];
        if (!slot) {
            console.log("Empty slot!");
            return false;
        }
        slot.quantity -= 1;

        if (slot.quantity <= 0) {
            this.slots[slotIndex] = null;
        }
        return true;
    }

    useItem(slotIndex, player) {
        const slot = this.slots[slotIndex];
        if (!slot) return false;

        // later call items effect
        console.log("Using " + slot.itemID);
        this.removeItem(slotIndex);
    }

    findEmptySlot(start, end) {
        for (let i = start; i < end; i++) {
            if (this.slots[i] === null) {
                return i;
            }
        }
        return -1;
    }

    equipSlot(slotIndex) {
        if (this.equippedSlot === slotIndex) {
            this.equippedSlot = null;
            console.log("Unequipped slot:", slotIndex + 1)
        } else if (this.slots[slotIndex]) {
            this.equippedSlot = slotIndex;
            console.log("Equipped slot:", slotIndex + 1)
        }
    }

    moveOrSwap(fromIndex, toIndex) {
        if (fromIndex === toIndex) return;

        const fromSlot = this.slots[fromIndex];
        const toSlot = this.slots[toIndex];

        if (!fromSlot) return;

        // swap
        this.slots[fromIndex] = toSlot;
        this.slots[toIndex] = fromSlot;
        console.log("Swapped", this.slots[fromIndex], "and", this.slots[toIndex]); 

        // equipped slot
        if (this.equippedSlot === fromIndex) {
            this.equippedSlot = toIndex;
        } else if (this.equippedSlot === toIndex) {
            this.equippedSlot = fromIndex;
        }
    }

    getEquippedItem() {
        return this.equippedSlot !== null ? this.slots[this.equippedSlot].itemID : null;
    }

    hasHotbarSpace() {
        return this.slots.slice(0, this.hotbarSize).some(slot => slot === null);
    }

    hasBackpackSpace() { 
        return this.slots.slice(this.hotbarSize).some(slot => slot === null);
    }
}