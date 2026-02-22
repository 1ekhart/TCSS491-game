import Customer from "/js/Customer.js";
import { getCategoryGrains, getCategoryMeats, getCategoryVegetables } from "/js/DataClasses/ItemList.js";
import { getRecipeData, recipeList } from "/js/DataClasses/RecipeList.js";
import { randomIntRange } from "/js/Util.js";

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

    spawnCustomer(spotIndex) {
        
        const exisitng = this.activeCustomers.get(spotIndex);
        if (exisitng) {
            exisitng.removeFromWorld = true;
            if (exisitng.prompt) exisitng.prompt.removeFromWorld = true;
        }

        const spot = this.spots[spotIndex];
        // const order = RECIPES.Burger; // update later to handle different orders
        let recipeID = this.selectRandomDish();
        const randomOrder = {
            recipeID: recipeID,
            specificIngredient: this.generateRandomRecipe(recipeID)
        }
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
        /*
        if (!isActive) {
            this.reset();
        }*/
        
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
        // get a random ingredient from 
        while (gotItem !== true) {
            const ingredientListLength = Object.keys(recipe).length;
            const keyIndex = randomIntRange(ingredientListLength, 1);
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
                gotItem = false;
            }
        }
    }
}