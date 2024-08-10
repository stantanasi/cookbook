import recipes from '../data/recipes.json'
import { IRecipe } from '../types/recipe.type'

export default {
  getRecipes: (): IRecipe[] => {
    return recipes
  },

  getRecipeById: (id: string): IRecipe | undefined => {
    return recipes.find((recipe) => recipe.id == id)
  },

  search: (query: string): IRecipe[] => {
    return recipes
      .map((recipe) => {
        const score = [query].concat(query.split(" ")).filter((word) => !!word)
          .map((word, i, words) => {
            const coef = words.length - i
            let score = 0

            if (recipe.title.match(new RegExp(`^${word}$`, 'i')))
              score += 100 * coef
            if (recipe.title.match(new RegExp(`^${word}`, 'i')))
              score += 90 * coef
            if (recipe.title.match(new RegExp(`\b${word}\b`, 'i')))
              score += 70 * coef
            if (recipe.title.match(new RegExp(`\b${word}\b`, 'i')))
              score += 50 * coef

            return score
          })
          .reduce((acc, cur) => acc + cur, 0)

        return {
          ...recipe,
          score: score,
        }
      })
      .sort((a, b) => b.score - a.score)
      .filter((recipe) => recipe.score != 0)
  },
}