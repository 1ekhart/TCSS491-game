import { STATION_STATE } from "/js/Constants/cookingStationStates.js";

export default class CookingStation {
    constructor(id) {
        this.id = id;

        this.state = STATION_STATE.IDLE;

        this.currentOrder = null;

        // oven - cooking phase
        this.cookProgress = 0;
        this.cookQuality = 1.0;

        // prep station - assembly phase
        this.ingredients = []; 

        this.currentIngredientIndex = 0;
        this.assemblyStepsRequired = 0;
        this.assemblyStepsCompleted = 0;
    }

    assignOrder(order) {
        if (this.state !== STATION_STATE.IDLE) {
            console.log("Cannot assign order to station.");
            return false;
        }
        this.currentOrder = order;
        this.ingredients = order.ingredients;

        this.cookTime = order.cookTime || 0;
        this.assembleTime = order.assembleTime || 0;
        this.state = STATION_STATE.HAS_ORDER;
        console.log("Order assigned to station.")
        return true;
    }

    // cooking phase : use for oven 
    canStartCooking() {
        return this.state === STATION_STATE.HAS_ORDER;
    }

    startCooking() {
        if (!this.canStartCooking()) {
            console.log("Station does not have an order.");
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

    reset() {
        this.state = STATION_STATE.IDLE;
        this.currentOrder = null;
        this.ingredients = [];
        this.cookQuality = 1.0;
        this.currentIngredientIndex = 0;
        this.assemblyStepsRequired = 0;
        this.assemblyStepsCompleted = 0;
    }
}