const Potato = {
    itemID: 3,
    name: "Potato",
    width: 16,
    height: 32,
    regrows: false,
    growTime: 2,
    scale: 2,
    assetName: "/Assets/WorldItems/PotatoPlant-Sheet.png"
}

const Cabbage = {
    itemID: 6,
    name: "Cabbage",
    width: 16,
    height: 32,
    regrows: false,
    growTime: 3,
    scale: 2,
    assetName: "/Assets/WorldItems/CabbagePlant-Sheet.png"
}

const Rice = {
    itemID: 4,
    name: "Rice",
    width: 16,
    height: 32,
    regrows: false,
    growTime: 2,
    scale: 2,
    assetName: "/Assets/WorldItems/RicePlant-Sheet.png"
}

const Pumpkin = {
    itemID: 12,
    name: "Pumpkin",
    width: 16,
    height: 32,
    regrows: false,
    growTime: 2,
    scale: 2,
    assetName: "/Assets/WorldItems/PumpkinPlant-Sheet.png"
}

const SugarCane = {
    itemID: 14,
    name: "Sugar Cane",
    width: 16,
    height: 32,
    regrows: false,
    growTime: 2,
    scale: 2,
    assetName: "/Assets/WorldItems/SugarPlant-Sheet.png"
}

const plantList = {
    3: Potato,
    4: Rice,
    6: Cabbage,
    12: Pumpkin,
    14: SugarCane,
}

export const getPlantData = (plantID) => {
    return plantList[plantID];
}

// plants should have 4 states for just planted, grown, and ready for Harvest
export const drawPlant = (ctx, plantID, x, y, growthStage) => {
    return plantList[plantID]
}
