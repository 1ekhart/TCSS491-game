
const PotatoStew = {
    recipeID: 1,
    requirementIDs: [3], // necessary items for recipe
    ingredientTypes: ["Vegetable"]
}

const RiceBowl = {
    recipeID: 1,
    itemID: 5,
    ingredients: {
        1: {
            hasSpecificIngredient: true,
            eligibleIngredients: [4] // rice
        },
        2: {
            hasSpecificIngredient: false,
            category: "Vegetable"
        },
        3: {
            hasSpecificIngredient: false,
            category: "Meat"
        }
    },
    steps: [
        { type: "ingredients"},
        { type: "chop", duration: 60},
        { type: "cook", duration: 120},
        { type: "assemble", duration: 60}
    ]
}

const Flour = { // joke/prototype item do not add!!
    recipeID: 0,
    itemID: 7,
    ingredients: {
        1: {
            hasSpecificIngredient: true,
            eligibleIngredients: [4] // rice
        },
        2: {
            hasSpecificIngredient: false,
            category: "Vegetable"
        },
        3: {
            hasSpecificIngredient: false,
            category: "Meat"
        },
        4: {
            hasSpecificIngredient: false,
            category: "Grain"
        },
        5: {
            hasSpecificIngredient: true,
            eligibleIngredients: [3]
        },
    }
}

const Burger = {
    recipeID: 2,
    itemID: 9,
    ingredients: {
        1: {
            hasSpecificIngredient: true,
            eligibleIngredients: [7]
        },
        2: {
            hasSpecificIngredient: true,
            eligibleIngredients: [3]
        },
        3: {
            hasSpecificIngredient: false,
            category: "Meat"
        },
        4: {
            hasSpecificIngredient: false,
            category: "Vegetable"
        }
    },
    steps: [
        { type: "ingredients"},
        { type: "cook", duration: 120},
        { type: "chop", duration: 120},
        { type: "assemble", duration: 60}
    ]
}

const Croquettes = {
    recipeID: 3,
    itemID: 11,
    ingredients: {
        1: {
            hasSpecificIngredient: true,
            eligibleIngredients: [3]
        },
        2: {
            hasSpecificIngredient: false,
            category: "Meat"
        }
    },
    steps: [
        { type: "ingredients"},
        { type: "chop", duration: 120},
        { type: "mix", duration: 60},
        { type: "cook", duration: 120},
        { type: "assemble", duration: 60}
    ]
}

const FriedPumpkin = {
    recipeID: 4,
    itemID: 13,
    ingredients: {
        1: {
            hasSpecificIngredient: true,
            eligibleIngredients: [12]
        },
        2: {
            hasSpecificIngredient: true,
            eligibleIngredients: [7]
        }
    },
    steps: [
        { type: "ingredients"},
        { type: "mix", duration: 60},
        { type: "cook", duration: 120},
        { type: "assemble", duration: 60}
    ]
}

export const recipeList = {
    1: RiceBowl,
    2: Burger,
    3: Croquettes,
    4: FriedPumpkin
}

export const getRecipeData = (recipeID) => {
    return recipeList[recipeID];
}