import { getSave } from "./GeneralUtils/SaveDataRetrieval.js";
import { CONSTANTS } from "/js/Util.js";

// hotbar # of slots
const HOTBAR_SIZE = 6;

// backpack # of slots
const BACKPACK_SIZE = 6;

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
        this.money = 0;
        this.loadSaveData();
    }

    loadSaveData() {
        const save = getSave();
        const saveInventory = save.inventory; // fill the inventory with the save data.

        for (const key in saveInventory) {
            console.log(key);
            const obj = saveInventory[key];
            this.slots[key] = {
                itemID: obj.itemID,
                quantity: obj.quantity
            }
        }

        this.money = save.money;
    }

    save(saveObj) {
        let data = {};
        for (let i = 0; i < this.totalSlots; i++) {
            if (this.slots[i]) {
                const slotData = {
                    itemID: this.slots[i].itemID,
                    quantity: this.slots[i].quantity
                }
                data[i] = slotData;
            }
        }
        if (CONSTANTS.DEBUG) {
            console.log(data);
        }
        saveObj.setInventory(data);
        saveObj.setMoney(this.money)
    };

    hasItem(itemID) { // return the inventory space if the item is in the inventory
        for (let i = 0; i < this.totalSlots; i++) {
            if (this.slots[i] && this.slots[i].itemID === itemID) {
                return i; 
            }
        }
        return null;
    }

    addItem(item) {
        // if item already exists, increment
        if (item.itemID == 1) { // if the ID for money, then just append the money count
            this.money += item.quantity * 50
            return true;
        }
        for (let i = 0; i < this.totalSlots; i++) {
            if (this.slots[i] && this.slots[i].itemID === item.itemID) {
                this.slots[i].quantity += item.quantity;
                if (CONSTANTS.DEBUG) {
                    console.log("Added to exisitng item, x"  + item.quantity);
                }
                return true;
            }
        }
        // otherwise check hotbar first for empty slot
        let index = this.findEmptySlot(0, this.hotbarSize);
        if (index !== -1) {
            this.slots[index] = item;
            if (CONSTANTS.DEBUG) {
                console.log("Item added to hotbar");
            }
            return true;
        }

        // then try backpack
        index = this.findEmptySlot(this.hotbarSize, this.totalSlots);
        if (index !== -1) {
            this.slots[index] = item;
            if (CONSTANTS.DEBUG) {
                 console.log("Item added to backpack");   
            }
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
            // unequip empty slot
            if (this.equippedSlot === slotIndex) {
                this.equippedSlot = null;
            }
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