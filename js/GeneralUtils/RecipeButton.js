import { getCategoryGrains, getCategoryMeats, getCategoryVegetables, getItemData } from "../DataClasses/ItemList.js";
import { getRecipeData } from "../DataClasses/RecipeList.js";
import Animator from "./Animator.js";
import Entity from "/js/AbstractClasses/Entity.js";
import { CONSTANTS } from "/js/Util.js";

const backgroundColor = "rgb(162, 118, 81)"
const backgroundColorTransparent = "rgba(162, 117, 81, 0.25)"
const padding = 32;
const iconScale = 1;
export default class RecipeButton { // like button but with some added features 
    constructor(parent, width, height, recipeID) {
        this.parent = parent;
        this.x = parent.x;
        this.y = parent.y;
        this.width = width;
        this.height = height;
        this.isVisible = true;
        this.isOpaque = false;
        this.requestedIngredients = []; // this contains the selected list of ingredients and we'll compare this to our recipe

        // get the recipe data, item data, along with the ingredients for rendering icons.
        this.recipeID = recipeID;
        this.recipeData = getRecipeData(recipeID);
        this.recipeItemData = getItemData(this.recipeData.itemID);
        this.dishName = this.recipeItemData.name;

        this.ingredientIcons = []; // we'll have an array of the different ingredient icons

        this.ingredientList = this.recipeData.ingredients
        const that = this;
        Object.keys(this.ingredientList).forEach(key => {
            const ingredient = that.ingredientList[key];
            if (ingredient.hasSpecificIngredient == true) { // if a specific ingredient's listed, set it to the first eligible item
                const specificIngredient = getItemData(ingredient.eligibleIngredients[0]);
                that.ingredientIcons.push(new Animator(ASSET_MANAGER.getAsset(specificIngredient.assetName), 0, 0, 
                                                specificIngredient.width, specificIngredient.height, 1, 1, 0));
            } else {
                // check which category and set it to a specific ingredient for each category
                if (ingredient.category == "Vegetable") {
                    that.ingredientIcons.push(new Animator(ASSET_MANAGER.getAsset("/Assets/Icons/CabbageIcon.png"), 0, 0, 32, 32, 1, 1, 0))
                } else if (ingredient.category == "Meat") {
                    that.ingredientIcons.push(new Animator(ASSET_MANAGER.getAsset("/Assets/Icons/BoarMeat.png"), 0, 0, 32, 32, 1, 1, 0))
                } else if (ingredient.category == "Grain") {
                    that.ingredientIcons.push(new Animator(ASSET_MANAGER.getAsset("/Assets/Icons/Flour.png"), 0, 0, 32, 32, 1, 1, 0))
                }
            }
        })
        this.hovered = false;
        console.log(this.ingredientIcons);

        this.iconScale = iconScale * 3 / Math.max(4, this.ingredientIcons.length)

        this.dishSprite = new Animator(ASSET_MANAGER.getAsset(this.recipeItemData.assetName), 0, 0, this.recipeItemData.width, this.recipeItemData.height, 1, 1, 0);
    }

    setVisible() {
        this.isVisible = true;
    }

    getName() {
        return this.dishName;
    }

    isValidRecipe() {
        return this.isOpaque;
    }

    // takes an array of item IDs and checks if they're valid ones.
    checkIngredients(ingredientArray) { // checks the currently selected ingredients, and makes the recipe button highlighted if so
        let isIngredientListValid = true;
        this.requestedIngredients = ingredientArray;

        if (ingredientArray.length !== this.ingredientIcons.length) {
            this.isOpaque = false;
            return;
        } 
        for (const data in this.ingredientList) {
            const item = this.ingredientList[data];
            if (item.hasSpecificIngredient == true) { // handle if specific ingredients
                console.log("checking specific ingredient")
                let itemValid = false;
                // const commonIngredients = filter =>
                for (const itemID in item.eligibleIngredients) { // iterate through the eligible ingredients, if the array has none, return
                    if (ingredientArray.includes(item.eligibleIngredients[itemID])) {
                        itemValid = true;
                        console.log("found item " + item.eligibleIngredients[itemID]);
                        break;
                    }
                    console.log("couldn't find specific ingredient " + itemID)
                }
                if (itemValid) continue;
                isIngredientListValid = false;
                break;
            } else { // check each category and if we don't get a match, then return, otherwise continue
                let itemValid = false;
                if (item.category == "Meat") {
                    const meats = getCategoryMeats();
                    for (let i = 0; i < meats.length; i++) { // iterate through the category, checking if the array has the item id of any in the category
                        if (ingredientArray.includes(meats[i].itemID)) {
                            itemValid = true;
                            console.log("found item " + meats[i].itemID);
                            break;
                        }
                    }
                    if (itemValid) continue;
                    console.log("couldn't find Meat")
                    isIngredientListValid = false;
                    break;
                } else if (item.category == "Vegetable") {
                    const category = getCategoryVegetables();
                    for (let i = 0; i < category.length; i++) {
                        if (ingredientArray.includes(category[i].itemID)) {
                            itemValid = true;
                            console.log("found item " + category[i].itemID);
                            break;
                        }
                        console.log("Ingredient array doesn't contain " + category[i].itemID)
                    }
                    if (itemValid) continue;
                    console.log("couldn't find vegetable")
                    isIngredientListValid = false;
                    break;
                } else if (item.category == "Grain") {
                    const category = getCategoryGrains();
                    for (let i = 0; i < category.length; i++) {
                        if (ingredientArray.includes(category[i].itemID)) {
                            itemValid = true;
                            break;
                        }
                    }
                    if (itemValid) continue;
                    console.log("couldn't find vegetable")
                    isIngredientListValid = false;
                    break;
                } else {console.log("invalid item category!" + item.category)}
            } 
        }

        if (isIngredientListValid == true) {
            this.isOpaque = true;
            this.requestedIngredients = ingredientArray;
            console.log("valid recipe")
        } else {
            this.isOpaque = false;
            console.log("not valid recipe")
            console.log(ingredientArray);
            console.log(this.ingredientList)
        }

    }

    changeX(deltaX) { // change the x position by some amount
        this.x += deltaX;
    }

    setX(x) {
        this.x = x;
    }

    changeY(deltaY) {
        this.y += deltaY;
    }

    setY(y) {
        this.y = y;
    }

    update(engine) {
        // if (this.x > parent.x + parent.width || this.y > parent.y + parent.height) {
        //     this.isVisible = false;
        //     return;
        // }
        if (engine.mouse && this.isVisible) {
            this.handleMouseDetection(engine)
        }
    }

    handleMouseDetection(engine) {
        const x = engine.mouse.x / CONSTANTS.SCALE; 
        const y = engine.mouse.y / CONSTANTS.SCALE;
        if (x >= this.x && x <= this.x + this.width &&
            y >= this.y && y <= this.y + this.height) {
            if (!this.hovered && this.isOpaque) {
                this.hovered = true;
                engine.setMouseSignal(1);
                this.parent.setSelectedElement(this.dishName);
            } else if (!this.hovered){
                this.parent.setSelectedElement(this.dishName);
            }
            if (engine.click && this.isOpaque) {
                console.log("JUST CLICKED")
                this.addRecipeToPlayer(engine);
                engine.setMouseSignal(0);
                engine.click = null;
            }
        } else if (this.hovered) {
            this.hovered = false;
            engine.setMouseSignal(0);
            this.parent.setSelectedElement("");
        }
    }

    addRecipeToPlayer(engine) {
        const inventory = engine.getPlayer().inventory;
        const that = this;
        for (const ingredientID in this.requestedIngredients) {
            console.log("remove item " + that.requestedIngredients[ingredientID])
            const index = inventory.hasItem(that.requestedIngredients[ingredientID]);
            if (index !== null) {
                inventory.removeItem(index);
            } else {
                console.log("Not enough Ingredients")
                that.isOpaque = false;
                that.parent.refreshIngredientData();
                return;
            }
        }
        inventory.addItem({
            itemID: this.recipeItemData.itemID, 
            quantity: 1, 
            isDish: true,
            ingredients: this.requestedIngredients
        });
        that.parent.refreshIngredientData();
    }
        

    draw(ctx, engine) {
        if (this.isVisible == true) {
            if (this.isOpaque == true) {
                ctx.fillStyle = backgroundColor;
            } else {
                ctx.fillStyle = backgroundColorTransparent;
            }

            ctx.strokeStyle = "rgb(58, 25, 17)"
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            ctx.fillRect(this.x, this.y, this.width, this.height);
            this.dishSprite.drawFramePlain(ctx, this.x, this.y + (this.height / 2) - (padding / 2), iconScale);
            ctx.strokeRect(this.x, this.y, padding, this.height);
            const scale = this.iconScale;
            for (let i = 0; i < this.ingredientIcons.length; i++) {
                this.ingredientIcons[i].drawFramePlain(ctx, 
                    40 + this.x + (padding * i * scale), this.y + (this.height/2) - (padding * scale / 2), 
                    scale);
            }

            if (this.isOpaque == false) {
                 ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        }
    }
}