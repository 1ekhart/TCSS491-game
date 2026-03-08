import Customer from "/js/Customer.js";
import { getCategoryGrains, getCategoryMeats, getCategoryVegetables, getItemData } from "/js/DataClasses/ItemList.js";
import { getRecipeData, recipeList } from "/js/DataClasses/RecipeList.js";
import { CONSTANTS, randomIntRange } from "/js/Util.js";

const customersPerDay = 6; 
export default class CustomerManager {
    constructor(engine, spots) {
        this.engine = engine;
        this.spots = spots; // seat positions
        this.activeCustomers = new Map(); // spotIndex -> customer
        this.spawnDelay = 2000; // ms after delivery
        this.initialized = false;
        this.active = false;
        this.customerCount = 6;
        this.respawnTimers = new Map();
    }

    update() {
        /*
        if (this.engine.getLevel().currentLevel !== 3) {
            return;
        }*/
        if (!this.active) return;

        if (!this.initialized) {
            for (let i = 0; i < this.spots.length; i++) {
                if (!this.activeCustomers.has(i)) {
                    this.spawnCustomer(i)
                }
            }
            this.initialized = true;
        }
    }

    buildIngredientArray(recipeID) {
        const recipe = getRecipeData(recipeID).ingredients;
        const finalIngredients = [];

        for (const key in recipe) {
            const ingredientSlot = recipe[key];

            if (ingredientSlot.hasSpecificIngredient) {
                const eligible = ingredientSlot.eligibleIngredients
                finalIngredients.push(eligible[randomIntRange(eligible.length, 0)]);
            } else {
                if (ingredientSlot.category === "Vegetable") {
                    const category = getCategoryVegetables();
                    finalIngredients.push(category[randomIntRange(category.length, 0)].itemID);
                } else if (ingredientSlot.category === "Meat") {
                    const category = getCategoryMeats();
                    finalIngredients.push(category[randomIntRange(category.length, 0)].itemID);
                } else if (ingredientSlot.category === "Grain") {
                    const category = getCategoryGrains();
                    finalIngredients.push(category[randomIntRange(category.length, 0)].itemID);
                }
            }
        }
        return finalIngredients;
    }

    spawnCustomer(spotIndex) {
        
        const exisitng = this.activeCustomers.get(spotIndex);
        if (exisitng) {
            exisitng.removeFromWorld = true;
            if (exisitng.prompt) exisitng.prompt.removeFromWorld = true;
        }

        const spot = this.spots[spotIndex];
        let recipeID = this.selectRandomDish();
        /**
        const randomOrder = {
            recipeID: recipeID,
            specificIngredient: this.generateRandomRecipe(recipeID)
        }*/
        const ingredientArray = this.buildIngredientArray(recipeID);
        const randomOrder = {
            recipeID: recipeID,
            ingredients: ingredientArray
        };
        console.log(randomOrder);

        const customer = new Customer (spot.x, spot.y, 16, 32, randomOrder, this.engine);

        customer.onComplete = () => {
            /**this.activeCustomers.delete(spotIndex);
            
            setTimeout(() => {
                this.spawnCustomer(spotIndex);
            }, this.spawnDelay);*/
            const timerId = setTimeout(() => {
                if (!this.active || this.customerCount <= 0) return;
                this.customerCount -= 1;
                this.spawnCustomer(spotIndex);
                console.log("Customers Left:" + this.customerCount)
            }, this.spawnDelay);
            this.respawnTimers.set(spotIndex, timerId);
        };

        this.engine.addEntity(customer, 3);
        this.engine.addEntity(customer.prompt);
        this.engine.addEntity(customer.timerDisplay);
        this.activeCustomers.set(spotIndex, customer);
    }

    setActive(isActive) {
        this.active = isActive;
    
        if (!isActive) {
            this.reset();
        }
        
    }

    reset() {
        this.activeCustomers.forEach(customer => {
            customer.removeFromWorld = true;
            if (customer.prompt) customer.prompt.removeFromWorld = true;
        });

        this.activeCustomers.clear();
        this.customerCount = customersPerDay;

        this.respawnTimers.forEach(timerId => {
            clearTimeout(timerId);
        });

        this.respawnTimers.clear();

        this.initialized = false;
    }

    selectRandomDish() { // returns the recipeID of the dish.
        const dishListLength = Object.keys(recipeList).length;
        const keyIndex = randomIntRange(dishListLength+1, 1);
        return (getRecipeData(keyIndex).recipeID);
    }

    generateRandomRecipe(recipeID) { // returns the item ID of a random item from the "all ___" categories of the dish
        const recipe = getRecipeData(recipeID).ingredients;
        let gotItem = false;
        // check the edge case that all ingredients are specific
        let hasAnyGenericIngredient = false;
        for (let i = 1; i <= Object.keys(recipe).length; i++) {
            const ingredient= recipe[i];
            if (ingredient.hasSpecificIngredient == false) {
                hasAnyGenericIngredient = true;
                if (CONSTANTS.DEBUG) {
                    console.log("Recipe " + recipeID + " has a specific ingredient at index: " + i)
                }
                break;
            }
        }
        if (hasAnyGenericIngredient != true) {
            if (CONSTANTS.DEBUG) {
                console.log("Recipe " + recipeID + " does not have any specific ingredient")
            }
            return null;
        }
        let amountOfLoops = 1;
        // get a random ingredient from 
        while (gotItem !== true) {
            const ingredientListLength = Object.keys(recipe).length;
            // if (amountOfLoops > ingredientListLength * 50) { // track the loop count and if there still isn't an ingredient found then raise a warning
            //     if (CONSTANTS.DEBUG) {
            //         console.log("For some reason could not find any specific ingredient for recipe: " + getItemData(getRecipeData(recipeID).itemID).name) 
            //     }
            //     return null;
            // }
            const keyIndex = randomIntRange(ingredientListLength + 1, 1);
            const ingredient = recipe[keyIndex];
            if (ingredient.hasSpecificIngredient != true) {
                if (ingredient.category == "Vegetable") {
                    const category = getCategoryVegetables();
                    const randomIndex = randomIntRange(category.length, 0);
                    gotItem = true;
                    return category[randomIndex].itemID;
                } else if (ingredient.category == "Meat") {
                    const category = getCategoryMeats();
                    const randomIndex = randomIntRange(category.length, 0);
                    gotItem = true;
                    return category[randomIndex].itemID;
                } else if (ingredient.category == "Grain") {
                    const category = getCategoryGrains();
                    const randomIndex = randomIntRange(category.length, 0);
                    gotItem = true;
                    return category[randomIndex].itemID;
                }
            } else {
                amountOfLoops++;
                gotItem = false;
            }
        }
    }
}