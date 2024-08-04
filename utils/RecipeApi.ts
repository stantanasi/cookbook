import recipes from '../data/recipes.json'
import { IRecipe } from '../types/recipe.type'

export default {
  getRecipes: (): IRecipe[] => {
    return recipes
  },

  getRecipeById: (id: string): IRecipe | undefined => {
    return recipes.find((recipe) => recipe.id == id)
  }
}