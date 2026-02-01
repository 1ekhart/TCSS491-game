const Pot = {
    itemID: 2,
    name: "Pot",
    width: 32,
    height: 32,
    scale: 1,
    assetName: "/Assets/WorldItems/grey-pot.png"
}

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

const itemList = {
    2: Pot,
    3: Potato
}

export const getPlantData = (plantID) => {
    return itemList[plantID];
}
export default class PotsAndPlants {
    getPlant(plantID) {
        return itemList[plantID];
    }
    drawPlant(ctx, plantID, x, y, growthStage) { // plants should have 4 states for just planted, grown, and ready for Harvest
        itemList[plantID]
    }
}