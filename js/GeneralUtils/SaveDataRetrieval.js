
/**
 * returns a parsed storage object for our save data
 * @returns 
 */
export const getSave = () => {
    if (localStorage) {
        const saveData = localStorage.getItem('saveData');
        const parsedData = JSON.parse(saveData);
        return parsedData;
    } else {
        console.log("error accessing local storage");
    }
}

/**
 * gets the local storage object
 * @returns 
 */
export const getStorage = () => {
    if (localStorage) {
        return localStorage;
    } else {
        console.log("error accessing local storage");
    }
}

/**
 * BE CAREFUL WITH THIS METHOD: after retrieving the save data and editing, pass the save to this method to save the changes.
 * @param {*} saveData this is the parsed version of getSave() that the caller calls and edits, then passes 
 */
export const appendSaveData = (saveData) => {
    if (localStorage) {
        const dataString = JSON.stringify(saveData);
        localStorage.setItem("saveData", dataString);
    } else {
        console.log("Couldn't not access local storage when attempting to save data")
    }
}

/**
 * Wipes all sava data, should be careful with this method, only the "new game" button on the main menu should be doing this.
 */
export const wipeSave = () => {
    const data = {
        dayCount: 1,
        money: 0,
        hasViewedTutorial: false,
        entities: {},
        inventory: {},
        upgrades: {},
    }
    if (localStorage) {
        const dataString = JSON.stringify(data);
        localStorage.setItem("saveData", dataString);
    }
    console.log("wiped save!")
}

export default class SaveDataRetrieval {
    constructor() { // initializes the save data object
        this.storage = getStorage();
        this.data = getSave();
        this.data.entities = {};
        this.data.inventory = {};
        this.upcomingData = {
            dayCount: this.data.dayCount,
            money: this.data.money,
            hasViewedTutorial: true,
            entities: {},
            inventory: {},
            upgrades: {},
        }
    }

    /**
     * syncs all of the items in the upcoming data object into the local storage data.
     */
    syncData() { 
        appendSaveData(this.upcomingData);
        this.data = getSave();
        this.upcomingData = {
            dayCount: this.data.dayCount,
            money: this.data.money,
            hasViewedTutorial: true,
            entities: {},
            inventory: {},
            upgrades: {},
        }
        console.log("saved Data!")
    }

    /**
     * 
     * @param {Number} day 
     */
    setDay(day) {
        this.upcomingData.dayCount = day;
    }

    /**
     * Saves the amount of money in the player's inventory into the upcoming data.
     * @param {Number} moneyAmt 
     */
    setMoney(moneyAmt) {
        this.upcomingData.money = moneyAmt;
    }

    /**
     * Save the inventory to the upcomingdata that will get synced later.
     * @param {*} InventoryData 
     */
    setInventory(InventoryData) {
        this.upcomingData.inventory = InventoryData;
    }

    /**
     * Adds all of the entities of a level to the upcoming entity data list, when adding an entity, it will go like "level1: {EntityList: {EntityData}}" 
     * The entities are refreshed every time there's a new upcoming data, so no need to check if an entity is already in the data
     * @param {*} EntityData 
     */
    setEntities(EntityData) {
    }

    
}