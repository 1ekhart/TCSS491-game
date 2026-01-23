import WorldEntity from "/js/AbstractClasses/WorldEntity.js";

/** modification to the entity class to have an interactable item that does something */
export default class EntityInteractable extends WorldEntity {
    constructor() {
        super();
        this.toggleState = false;
    }

    toggleEntity() {

    }

    unToggleEntity() {

    }
}
