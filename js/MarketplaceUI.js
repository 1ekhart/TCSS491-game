import Button from "/js/AbstractClasses/Button.js";
import Entity from "/js/AbstractClasses/Entity.js";
import { getItemData } from "/js/DataClasses/ItemList.js";
import { CONSTANTS } from "/js/Util.js";

const rowSize = 6; // vertical length
const columnSize = 4; // horizontal length
export default class MarketPlaceUI extends Entity {
    constructor(engine, parent) {
        super();
        this.engine = engine;
        this.x = (CONSTANTS.CANVAS_WIDTH / CONSTANTS.SCALE) / (6) // take up 2/3 of the screen;
        this.y = (CONSTANTS.CANVAS_WIDTH / CONSTANTS.SCALE) / (16) // take up from the top 1/8 to 6/8
        this.width = this.x * (4);
        this.height = this.y * (10);
        this.text = "Marketplace";
        // we probably want to have 24 things to buy at most so we'll have 24 buttons
        this.buttonWidth = (this.width * 5/6)  / columnSize;
        this.buttonHeight = (this.height * 3 / 4) / rowSize;
        // this.columns = []; // create a column of sale buttons
        
        this.items = [2, 3];
        // function to destroy object;
        const that = this;
        const close = () => {
            that.removeFromWorld = true;
            this.buttons.forEach(function (entity) {
                entity.removeFromWorld = true;
            })
            parent.displaying = false;
        }

        
        this.closeButton = new Button(this.x + this.width - (this.width / (4)), this.y + this.height - (this.height / (12) + 4), 
            (this.width / (4)) - 10, (this.height / (12)) - 5, close, "Close?", "#9093a1c3", "#1a1a1abf", "#9093a18d");

        this.buttons = [];
        let x = this.x + (this.buttonHeight / 2);
        for (let i = 0; i < columnSize; i++) {
            for (let j = 0; j < rowSize; j++) {
                this.itemSale(x, j, this.items[i + j]);
            }
            x += this.buttonWidth + 5;
        }

        this.buttons.push(this.closeButton);
        
        this.buttons.forEach(function (entity) {
            engine.addUIEntity(entity);
        });
        
    }

    load() {

    }

    itemSale(x, columnIndex, itemid) { // creates a button for buying an item and pushes it vertically into column
        if (itemid) {
            const itemData = getItemData(itemid);
            if (itemData) {
                const name = itemData.name;
                const price = itemData.sellPrice;
                const txt = "" + name + ":$" + price;
                const that = this;
                const item = {
                    itemID: itemid,
                    quantity: 1
                };
                const addToInventory = () => {
                    const player = that.engine.getPlayer();
                    const slotIndex = player.inventory.slots[player.inventory.hasItem(1)];
                    if (slotIndex) { // we'll use item 1 as currency for now
                        player.inventory.removeItem(player.inventory.hasItem(1));
                        player.inventory.addItem(item); 
                    }
                }
                const newButton = new Button(x, this.y + this.buttonHeight + (columnIndex * this.buttonHeight), 
                this.buttonWidth, this.buttonHeight, addToInventory, txt, "#9093a1f2", "#1a1a1aec", "#9093a18d");
                this.buttons.push(newButton);
                return;
            } 
        } 

        console.log("added sale button")
        const doNothing = () => {};
        const newButton = new Button(x, this.y + this.buttonHeight + (columnIndex * this.buttonHeight),
        this.buttonWidth, this.buttonHeight, doNothing, "Empty", "#9093a1f2", "#1a1a1aec", "#9093a18d");
        this.buttons.push(newButton);
        return;
    }

    draw(ctx, engine) {
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, (2 * CONSTANTS.SCALE));
        ctx.fillStyle = "#3e71ff68";
        ctx.fill();

        ctx.fillStyle = "#000000"
        ctx.fillText(this.text,  this.x + (this.width / 2), this.y + (this.height / 8));

    }
}