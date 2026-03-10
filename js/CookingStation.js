import { STATION_STATE, STEP_TYPE } from "/js/Constants/cookingStationStates.js";
import { getRecipeData } from "/js/DataClasses/RecipeList.js";
import { getCategoryGrains, getCategoryMeats, getCategoryVegetables } from "/js/DataClasses/ItemList.js";

export default class CookingStation {
    constructor(id) {
        this.id = id;

        this.state = STATION_STATE.IDLE;

        this.currentOrder = null;
        this.ingredients = []; 

        // oven - cooking phase
        //this.cookProgress = 0;
        this.cookQuality = 1.0;

        // prep station - assembly phase

        this.currentIngredientIndex = 0;
        this.assemblyStepsRequired = 0;
        this.assemblyStepsCompleted = 0;

        this.currentStepIndex = 0;
    }

    assignOrder(order) {
        if (this.state !== STATION_STATE.IDLE) {
            console.log("Cannot assign order to station.");
            return false;
        }
        this.currentOrder = order;
        this.ingredients = order.ingredients;

        //this.cookTime = order.cookTime || 0;
        //this.assembleTime = order.assembleTime || 0;
        this.state = STATION_STATE.HAS_ORDER;
        //this.state = STATION_STATE.WAITING_FOR_INGREDIENTS;
        console.log("Order assigned to station.")
        return true;
    }

    getCurrentStep() {
        if (!this.currentOrder) return null;
        const steps = getRecipeData(this.currentOrder.recipeID).steps;
        return steps?.[this.currentStepIndex] ?? null;
    }

    canHandleStep(stepType) {
        const step = this.getCurrentStep();
        if (!step) return false;

        if (stepType === STEP_TYPE.INGREDIENTS) {
            return this.state === STATION_STATE.HAS_ORDER && step.type === STEP_TYPE.INGREDIENTS;
        }
        return this.state === STATION_STATE.STEP_COMPLETE && step.type === stepType;
    }

    hasExactIngredients(selectedIngredients) {
        if (!this.currentOrder || !selectedIngredients) return false;
        /*
        const required = [...this.currentOrder.ingredients];
        const supplied = [...selectedIngredients];

        if (required.length !== supplied.length) return false;

        const remaining = [...supplied];
        for (const reqID of required) {
            const idx = remaining.indexOf(reqID);
            if (idx === -1) return false;
            remaining.splice(idx, 1);
        }*/

        
        const required = [...this.currentOrder.ingredients];
        const supplied = [...selectedIngredients];

        if (required.length !== supplied.length) return false;

        for (let i = 0; i < required.length; i++) {
            if (!supplied.includes(required[i])) return false;
        }
       /*
        const recipe = getRecipeData(this.currentOrder.recipeID);
        if (!recipe) return false;

        const ingredientDefs = recipe.ingredients;
        const keys = Object.keys(ingredientDefs);

        if (selectedIngredients.length !== keys.length) return false;

        const remaining = [...selectedIngredients];

        for (const key of keys) {
            const slot = ingredientDefs[key];
            let matchIndex = -1;

            if (slot.hasSpecificIngredient) {
                matchIndex = remaining.findIndex(id => slot.eligibleIngredients.includes(id));
            } else if (slot.category === "Meat") {
                const meats = getCategoryMeats().map(m => m.itemID);
                matchIndex = remaining.findIndex(ided => meats.includes(id));
            } else if (slot.category === "Vegetable") {
                const vegs = getCategoryVegetables().map(v => v.itemID);
                matchIndex = remaining.findIndex(id => vegs.includes(id));
            } else if (slot.category === "Grain") {
                const grains = getCategoryGrains().map(g => g.itemID);
                matchIndex = remaining.findIndex(id => grains.includes(id));
            }

            if (matchIndex === -1) return false;
            remaining.splice(matchIndex, 1); // consume the match
        }*/

        return true;
    }

    supplyIngredients(selectedIngredients) {
        if (!this.canHandleStep(STEP_TYPE.INGREDIENTS)) return false;
        if (!this.hasExactIngredients(selectedIngredients)) {
            console.log("Ingredients do not match order!");
            return false;
        }
        this.ingredients = [...selectedIngredients];
        this.advanceStep();
        console.log("Ingredients supplied successfully!");
        return true;
    }
    
    // call in station to start step
    beginStep(stepType) {
        if (!this.canHandleStep(stepType)) return false;
        this.state = STATION_STATE.IN_STEP;
        console.log("Beginning step: ", stepType);
        return true;
    }

    // call when step finishes
    completeStep(quality=1.0) {
        if (this.state !== STATION_STATE.IN_STEP) return false;
        this.cookQuality = quality;
        this.advanceStep();
        return true;
    }

    advanceStep() {
        const steps = getRecipeData(this.currentOrder.recipeID).steps;
        this.currentStepIndex++;
        if (this.currentStepIndex >= steps.length) {
            this.state = STATION_STATE.COMPLETE;
            console.log("Order complete!");
        } else {
            this.state = STATION_STATE.STEP_COMPLETE;
            console.log("Step done, next step: ", steps[this.currentStepIndex].type);
        }
    }    

    // cooking phase : use for oven 
    canStartCooking() {
        return this.state === STATION_STATE.HAS_INGREDIENTS;
    }

    startCooking() {
        if (!this.canStartCooking()) {
            console.log("Station does not have an order and/or ingredients.");
            return false;
        }
        this.state = STATION_STATE.COOKING;
        console.log("Cooking started.");
        return true;
    }

    finishCooking(quality = 1.0) {
        if (this.state !== STATION_STATE.COOKING) {
            console.log("Cannot finish cooking!");
            return false;
        }
        this.cookQuality = quality;
        this.state = STATION_STATE.ASSEMBLE_READY;
        console.log("Ready to assemble!");
        return true;
    }

    // assembly phase : use for prep station
    canStartAssembly() {
        return this.state === STATION_STATE.ASSEMBLE_READY;
    }

    startAssembly(stepCount) {
        if (!this.canStartAssembly()) {
            console.log("Cannot start assembly!");
            return false;
        }
        this.assemblyStepsRequired = stepCount;
        this.assemblyStepsCompleted = 0;
        this.currentIngredientIndex = 0;
        this.state = STATION_STATE.ASSEMBLING;
        console.log("Assembling!");
        return true;
    }

    completeAssemblyStep() {
        if (this.state !== STATION_STATE.ASSEMBLING) {
            console.log("Cannot complete assembly.");
            return false;
        }

        this.assemblyStepsCompleted++;
        this.currentIngredientIndex++;

        if (this.assemblyStepsCompleted >= this.assemblyStepsRequired) {
            this.state = STATION_STATE.COMPLETE;
            console.log("Order complete!");
        }
        return true;
    }

    isComplete() {
        return this.state === STATION_STATE.COMPLETE;
    }
    
    // returns step duration
    getCurrentStepDuration(defaultDuration) {
        return this.getCurrentStep()?.duration ?? defaultDuration;
    }



    reset() {
        this.state = STATION_STATE.IDLE;
        this.currentOrder = null;
        this.ingredients = [];
        this.cookQuality = 1.0;
        this.currentStepIndex = 0;

        this.currentIngredientIndex = 0;
        this.assemblyStepsRequired = 0;
        this.assemblyStepsCompleted = 0;
    }
}