import Button from "/js/AbstractClasses/Button.js";
import Entity from "/js/AbstractClasses/Entity.js";
import { getItemData } from "/js/DataClasses/ItemList.js";
import { recipeList } from "/js/DataClasses/RecipeList.js";
import Animator from "/js/GeneralUtils/Animator.js";
import OnScreenTextSystem from "/js/GeneralUtils/OnScreenText.js";
import RecipeButton from "/js/GeneralUtils/RecipeButton.js";
import InventoryUI from "/js/InventoryUI.js";
import { CONSTANTS } from "/js/Util.js";

const maxElementsShown = 6; // show this many elements per time
const elementPadding = 5;
const MAX_INGREDIENTS = 6;
export class RecipePanel extends Entity{ // the recipe panel section of the UI
    constructor(parent, engine, x, y, width, height, color) {
        super();
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.color = color;
        this.elements = [];
        this.color = color;
        this.engine = engine;

        this.buttonWidth = (this.width);
        this.buttonHeight = (this.height * 3 / 4) / maxElementsShown;
        this.selectedElement = "";

        this.startIndex = 0;
        this.endIndex = 0;
        this.ingredientArray = []
        this.parent = parent;
    }

    checkIngredients(ingredientArray) {
        const newElementList = [];
        this.ingredientArray = ingredientArray;
        for (let i = 0; i < this.elements.length; i++) {
            const recipeButton = this.elements[i];
            recipeButton.checkIngredients(ingredientArray);
            if (this.elements[i].isValidRecipe())  { // push the item into the top of the list if valid
                newElementList.unshift(this.elements[i]);
            } else {
                newElementList.push(this.elements[i]);
            }
        }
        this.elements = newElementList;
        this.startIndex = 0;
        this.endIndex = Math.min(this.elements.length, maxElementsShown)
        this.setVisibilities();
        this.setVisibleElementsY();
    }

    refreshIngredientData() {
        this.parent.ensureIngredientsAreAvailable();
    }

    setSelectedElement(recipeName) {
        this.selectedElement = recipeName;
        this.parent.displayRecipeName(recipeName);
    }

    scrollUp() {
        if (startIndex <= 0) {return;}
        this.startIndex--;
        this.endIndex--;
        this.setVisibilities();
        this.setVisibleElementsY();
    }

    setVisibleElementsY() {
        let counter = 0;
        for (let i = this.startIndex; i < this.endIndex; i++) {
            this.elements[i].setY(this.y + (this.buttonHeight * counter));
            counter += 1;
        }
    }

    setVisibilities() {
        for (let i = 0; i < this.elements.length; i++) {
            if (i < this.startIndex) {
                this.elements[i].isVisible = false;
            } else if (i > this.endIndex) {
                this.elements[i].isVisible = false;
            } else {
                this.elements[i].isVisible = true;
            }
        }
    }

    scrollDown() {
        if (this.endIndex)
        this.startIndex++;
        this.endIndex++;
        this.setVisibilities();
        this.setVisibleElementsY();
    }

    addRecipe(recipeID) {
        const button = new RecipeButton(this, this.buttonWidth, this.buttonHeight, recipeID)
        this.elements.push(button);
        this.engine.addUIEntity(button);
        button.changeY((this.elements.length - 1) * this.buttonHeight);
        if (this.endIndex - this.startIndex < maxElementsShown) {
            this.endIndex++;
        }
    }

    destroy() {
        this.removeFromWorld = true;
        this.elements.forEach(function (entity) {
            console.log("destroyed!")
            entity.removeFromWorld = true;
        })
    }

    update(engine) {
        if (engine.wheel) {
            if (engine.wheel.deltaY > 0) { // handle scrolling down
                
            } else {

            }
            engine.wheel = null;
        }
    }

    draw(ctx, engine) {
        ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, this.width, this.height, (2 * CONSTANTS.SCALE));
    }
}

const slotSize = 32;
export class inventorySelection extends Entity {
    constructor(parent, engine, x, y, width, height, color) {
        super();
        this.parent = parent;
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.color = color;
        this.engine = engine;
        this.playerInventory = engine.getPlayer().inventory;
        this.player = engine.getPlayer();
        this.maxElementsPerRow = Math.floor(width / slotSize);
        this.maxElementsPerColumn = Math.floor(height / slotSize);
        this.paddingX = (this.width - (this.maxElementsPerRow * slotSize) ) / this.maxElementsPerRow;
        this.paddingY = (this.height - (this.maxElementsPerColumn * slotSize)) / this.maxElementsPerColumn;
        this.inventorySize = this.playerInventory.backpackSize + this.playerInventory.hotbarSize;
        this.isHovered = false;
        // console.log(this.maxElementsPerRow);

    }

    update(engine) {
        this.inventorySize = this.playerInventory.backpackSize + this.playerInventory.hotbarSize;
        
        if (engine.mouse) {
            const x = engine.mouse.x / CONSTANTS.SCALE;
            const y = engine.mouse.y / CONSTANTS.SCALE;
            if (x >= this.x && x <= this.x + this.width &&
            y >= this.y && y <= this.y + this.height) {
                if (!this.isHovered) {
                    this.isHovered = true;
                    engine.setMouseSignal(1);
                }
            } else if (this.isHovered){
                this.isHovered = false;
                engine.setMouseSignal(0);
            }

            if (engine.click) {
                    const slotIX = this.getSlotIndex(x, y);
                    // console.log(slotIX);
                    if (slotIX !== null && this.playerInventory.slots[slotIX]) {
                        // console.log(this.playerInventory.slots[slotIX].itemID)
                        this.parent.appendIngredients(this.playerInventory.slots[slotIX].itemID);
                        engine.click = null;
                    }
                }
        }
    }

    getSlotIndex(xClick, yClick) {
        for (let i = 0; i < (this.inventorySize); i++) {
            const row = Math.floor((i / this.maxElementsPerRow));
            const col = (i % (this.maxElementsPerRow));
            const x = this.x + this.paddingX + col * (slotSize + this.paddingX);
            const y = this.y + this.paddingY + row * (slotSize + this.paddingY);

            if (xClick >= x && xClick <= x + slotSize && yClick >= y && yClick <= y + slotSize) {
                // console.log("Clicked on " + i + ", ButtonX = " + x + ", ButtonY = " + y + ", and MouseX = " + xClick + " and MouseY = " + yClick)
                return i;
            } 
        }
    }

    draw(ctx, engine) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height)
        for (let i = 0; i < this.inventorySize; i++) {
            const row = Math.floor((i / this.maxElementsPerRow));
            const col = (i % (this.maxElementsPerRow));
            const x = this.x + this.paddingX + col * (slotSize + this.paddingX);
            const y = this.y + this.paddingY + row * (slotSize + this.paddingY);
            

            ctx.fillStyle = "#22222265";
            ctx.fillRect(x, y, slotSize, slotSize);

            const slot = this.playerInventory.slots[i];
            if (!slot) { continue;}
            // const col = i % this.maxElementsPerRow;
            // const row = Math.floor(i / this.maxElementsPerColumn);
            

            // ctx.fillStyle = "#222";
            // ctx.fillRect(x, y, slotSize, slotSize);

            if (slot) {
                slot.itemData = getItemData(slot.itemID); 
                if (slot.itemData) {
                    slot.sprite = new Animator(ASSET_MANAGER.getAsset(slot.itemData.assetName), 0, 0, slot.itemData.width, slot.itemData.height, 1, 1, 0);
                }
            }
            if (slot.itemData) {
                slot.sprite.drawFramePlain(ctx, x, y, slot.itemData.scale * (slotSize / slot.itemData.width));
            } else {
                ctx.fillStyle = "#0f0";
                ctx.fillRect(x + 4, y + 4, slotSize - 8, slotSize - 8);
            }


            ctx.fillStyle = "#fff";
            ctx.font = "12px monospace";
            const txtMetrics = ctx.measureText(slot.quantity);
            ctx.fillText(slot.quantity, x + slotSize - txtMetrics.width, y + slotSize - 6);
        }
    }
}

export class SelectedIngredientsArray extends Entity {
    constructor(engine, x, y, elementSize) {
        super();
        this.engine = engine;
        this.x = x;
        this.y = y;
        this.elements = []
        this.padding = 5;
        this.elementSize = elementSize;
        this.txtMetrics = CONSTANTS.CONTEXT.measureText("Selected Ingredients");
        this.elementData = [];
    }

    getIngredientArray() {
        return this.elements;
    }

    addIngredient(itemID) {
        if (this.elements.length < this.elementSize) {
            if (this.elements.includes(itemID)) { return;}
            this.elements.push(itemID);
        }
    }

    removeIngredient(index) {
        this.elements.splice(index, 1)
        this.elementData.splice(index, 1)
    }

    clearIngredients() {
        this.elements = [];
        this.elementData = [];
    }

    update(engine) {}

    draw(ctx, engine) {
        for (let i = 0; i < this.elementSize; i++) {
            const block = i % this.elementSize;
            const x = this.x + this.padding + block * (slotSize + this.padding);
            ctx.fillStyle = "rgba(228, 183, 105, 0.9)"
            ctx.fillRect(x, this.y, slotSize, slotSize);
            const element = this.elements[i];
            let elementData = this.elementData[i];
            if (!element) { continue;}
            if (!elementData) {
                this.elementData[i] = getItemData(element);
                elementData = this.elementData[i];
                if (this.elementData[i]) {
                    elementData.sprite = new Animator(ASSET_MANAGER.getAsset(elementData.assetName), 0, 0, elementData.width, elementData.height, 1, 1, 0);
                }
            }
            if (elementData.sprite) {
                elementData.sprite.drawFramePlain(ctx, x, this.y, elementData.scale * (slotSize / elementData.width))
            } else {
                ctx.fillStyle = "#0f0";
                ctx.fillRect(x + 4, y + 4, slotSize - 8, slotSize - 8);
            }
        }
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.fillText("Selected Ingredients", this.x + (slotSize * this.elementSize / 2) - (this.txtMetrics.width / 4) - 8, this.y - 16);
    }
}

const cookingStationBGColor = "#ae885a98";
const maximumSelectedIngredients = 6;
export default class CookingStationUI extends Entity {
    constructor(engine, parent) {
        super();
        this.engine = engine;
        this.x = (CONSTANTS.CANVAS_WIDTH / CONSTANTS.SCALE) / (12) // take up 2/3 of the screen;
        this.y = (CONSTANTS.CANVAS_WIDTH / CONSTANTS.SCALE) / (16) // take up take up 7/8 of the screen height;
        this.width = this.x * (10);
        this.height = this.y * (10);
        this.recipes = [1];
        const that = this;
        const close = () => {
            that.removeFromWorld = true;
            that.recipeBar.destroy();
            this.nestedElements.forEach(function (entity) {
                entity.removeFromWorld = true;
            })
            parent.displaying = false;

            that.engine.entities[7].forEach(function (entity) {
                if (entity instanceof InventoryUI) {
                    entity.setVisibility(true);
                }
            })
        }

        const clear = () => {
            that.ingredientSelection.clearIngredients();
            that.recipeBar.checkIngredients(that.ingredientSelection.getIngredientArray());
        }

        this.engine.entities[7].forEach(function (entity) { // hide inventory
                if (entity instanceof InventoryUI) {
                    entity.setVisibility(false);
                }
            })

        this.nestedElements = [] // our list of elements in the item;


        this.closeButton = new Button(this.x + 5, this.y + 5, 
            (this.width / (4)) - 15, (this.height / (12)) - 5, close, "Close?", "#9093a1c3", "#1a1a1abf", "#9093a145");
        this.nestedElements.push(this.closeButton);
        this.nestedElements.push(new Button(
            this.x + this.width - (this.width / 3) - (this.width / 3) - 5, this.y + 5, (this.width / (3)) - 5, 
            (this.height / (12)) - 5, clear, "Clear Selected", "#9093a1c3", "#1a1a1abf", "#9093a145"))


        // set up recipe list bar
        this.initializeRecipes();

        //  
        this.nestedElements.push(new inventorySelection(this, this.engine, 
            this.x, this.y + (this.height/ 2), 
            this.width - this.recipeBar.width, this.height / 2, 
            "rgba(114, 78, 36, 0.36)"));

        this.ingredientSelection = new SelectedIngredientsArray(this.engine, 
            this.x + (this.width / 4) - (MAX_INGREDIENTS * slotSize / 2) + 24, this.y + (this.height / 4) + 32, MAX_INGREDIENTS)
        this.nestedElements.push(this.ingredientSelection);

        this.nestedElements.forEach(function (entity) {
            engine.addEntity(entity, 6);
        });

        this.selectedIngredientCount = 0;
    }

    ensureIngredientsAreAvailable() {
        const ingredientArray = this.ingredientSelection.getIngredientArray();
        const playerInventory = this.engine.getPlayer().inventory;
        let arrayLength = ingredientArray.length;
        for (let i = 0; i < arrayLength; i++) {
            if (playerInventory.hasItem(ingredientArray[i]) == null) {
                this.ingredientSelection.removeIngredient(i);
                arrayLength--;
                i--;
            } 
        }
        this.recipeBar.checkIngredients(this.ingredientSelection.getIngredientArray());
    }



    initializeRecipes() { // recipe panel should take up the right 1/3 of the UI menu
        const recipeBarWidth = this.width / 3; // take up 1/3 
        this.recipeBar = new RecipePanel(this, this.engine, this.x + this.width - recipeBarWidth, this.y, recipeBarWidth,this.height,  "rgba(114, 78, 36, 0.91)")
        for (const recipe in recipeList) {
            this.recipeBar.addRecipe(recipeList[recipe].recipeID);
        }
        this.engine.addEntity(this.recipeBar, 6)
    }

    appendIngredients(itemID) {
        this.ingredientSelection.addIngredient(itemID);
        this.recipeBar.checkIngredients(this.ingredientSelection.getIngredientArray());
    }

    displayRecipeName(name) {
        if (name) {
            this.recipeName = "Make " + name + "?";
        }
    }

    update() {

    }

    draw(ctx, engine) {
        ctx.fillStyle = cookingStationBGColor;
        ctx.fillRect(this.x, this.y, this.width, this.height, (2 * CONSTANTS.SCALE));
        if (this.recipeName) {
            ctx.save()
            ctx.font = "20px monospace";
            ctx.fillStyle = "rgb(0, 0, 0)"
            const txtMetrics = ctx.measureText(this.recipeName);
            ctx.fillText(this.recipeName, this.x + (this.width / 3) - (txtMetrics.width / 2), this.y + (this.height / 6))
            ctx.restore();
        }
    }
}