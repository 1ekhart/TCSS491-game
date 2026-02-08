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

const itemList = {
    2: Pot,
    3: Potato
}

export const getItemData = (itemID) => {
    return itemList[itemID];
}