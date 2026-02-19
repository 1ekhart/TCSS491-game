import Customer from "/js/Customer.js";
import { RECIPES } from "/js/Data/Recipes.js";

export default class CustomerManager {
    constructor(engine, spots) {
        this.engine = engine;
        this.spots = spots; // seat positions
        this.activeCustomers = new Map(); // spotIndex -> customer
        this.spawnDelay = 2000; // ms after delivery
        this.initialized = false;
        this.active = false;

        this.respawnTimers = new Map();
    }

    update() {
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
        const order = RECIPES.Burger; // update later to handle different orders

        const customer = new Customer (spot.x, spot.y, 16, 32, order, this.engine);

        customer.onComplete = () => {
            /**this.activeCustomers.delete(spotIndex);
            
            setTimeout(() => {
                this.spawnCustomer(spotIndex);
            }, this.spawnDelay);*/
            const timerId = setTimeout(() => {
                if (!this.active) return;
                this.spawnCustomer(spotIndex);
            }, this.spawnDelay);
            this.respawnTimers.set(spotIndex, timerId);
        };

        this.engine.addEntity(customer, 3);
        this.engine.addEntity(customer.prompt);
        this.activeCustomers.set(spotIndex, customer);
    }

    setActive(isActive) {
        this.active = isActive;
    }

    reset() {
        this.activeCustomers.forEach(customer => {
            customer.removeFromWorld = true;
            if (customer.prompt) customer.prompt.removeFromWorld = true;
        });

        this.activeCustomers.clear();

        this.respawnTimers.forEach(timerId => {
            clearTimeout(timerId);
        });

        this.respawnTimers.clear();

        this.initialized = false;
    }
}