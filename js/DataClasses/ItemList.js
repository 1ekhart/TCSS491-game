const Coin = {
    itemID: 1,
    name: "Coin",
    width: 16,
    height: 16,
    scale: 1.4,
    sellPrice: 50,
    assetName: "/Assets/Icons/Coin.png"
}
const Pot = {
    itemID: 2,
    name: "Pot",
    width: 32,
    height: 32,
    scale: 1,
    sellPrice: 200,
    assetName: "/Assets/WorldItems/grey-pot.png"
}

const Potato = {
    itemID: 3,
    name: "Potato",
    width: 32,
    height: 32,
    scale: 1,
    sellPrice: 50,
    assetName: "/Assets/Icons/PotatoIcon.png"
}

const Rice = {
    itemID: 4,
    name: "Rice",
    width: 32,
    height: 32,
    scale: 1,
    sellPrice: 20,
    assetName: "/Assets/Icons/Rice.png"
}

const RiceBowl = {
    itemID: 5,
    name: "Rice Bowl",
    width: 32,
    height: 32,
    scale: 1,
    sellPrice: 150,
    assetName: "/Assets/Icons/RiceBowl.png"
}

const Cabbage = {
    itemID: 6,
    name: "Cabbage",
    width: 32,
    height: 32,
    scale: 1,
    sellPrice: 50,
    assetName: "/Assets/Icons/CabbageIcon.png"
}

const Flour = {
    itemID: 7,
    name: "Flour",
    width: 32,
    height: 32,
    scale: 1,
    sellPrice: 20,
    assetName: "/Assets/Icons/Flour.png"
}

const BoarMeat = {
    itemID: 8,
    name: "Boar Meat",
    width: 32,
    height: 32,
    scale: 1,
    sellPrice: 100,
    assetName: "/Assets/Icons/BoarMeat.png"
}

const itemList = {
    1: Coin,
    2: Pot,
    3: Potato,
    4: Rice,
    5: RiceBowl,
    6: Cabbage,
    7: Flour,
    8: BoarMeat,
}

const grains = [Rice, Flour]
const vegetables = [Cabbage, Potato]
const meats = [BoarMeat]

const itemListNames = {
    Pot: Pot,
    Potato: Potato,
    Rice: Rice,
    "Rice Bowl": RiceBowl, 
    Cabbage: Cabbage,
}

export const getCategoryGrains = () => {
    return grains;
}

export const getCategoryVegetables = () => {
    return vegetables;
}

export const getCategoryMeats = () => {
    return meats;
}

export const getItemData = (itemID) => {
    return itemList[itemID];
}

export const getItemByName = (itemName) => {
    return itemListNames[itemName];
}