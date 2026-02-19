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

const Flour = {
    recipeID: 2,
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

export const recipeList = {
    1: RiceBowl,
    2: Flour
}

export const getRecipeData = (recipeID) => {
    return recipeList[recipeID];
}