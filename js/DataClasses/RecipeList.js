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
    }
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
    }
}

export const recipeList = {
    1: RiceBowl,
    2: Burger
}

export const getRecipeData = (recipeID) => {
    return recipeList[recipeID];
}