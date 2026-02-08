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

export const getStorage = () => {
    if (localStorage) {
        return localStorage;
    } else {
        console.log("error accessing local storage");
    }
}

/**
 * BE CAREFUL WITH THIS METHOD: after retrieving the save data and editing, pass to this method to 
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

export const wipeSave = () => {
    const data = {
        dayCount: 1,
        money: 0,
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
    constructor() {

    }
}