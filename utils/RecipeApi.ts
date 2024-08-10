import recipesJSON from '../data/recipes.json'
import { IRecipe } from '../types/recipe.type'
import Constants from './constants'
import { removeDiacritics } from './utils'

export default {
  getRecipes: (): IRecipe[] => {
    const recipes = recipesJSON
      .map((recipe) => ({
        ...recipe,
        image: Constants.IMAGE_BASE_URL + recipe.image,
      }))

    return recipes
  },

  getRecipeById: (id: string): IRecipe | undefined => {
    const recipe = recipesJSON.find((recipe) => recipe.id == id)
    if (recipe)
      return {
        ...recipe,
        image: Constants.IMAGE_BASE_URL + recipe.image,
      }
    return undefined
  },

  search: (query: string): IRecipe[] => {
    return recipesJSON
      .map((recipe) => {
        const score = [query].concat(query.split(" ")).filter((word) => !!word)
          .map((word, i, words) => {
            const coef = words.length - i
            let score = 0

            if (recipe.title.match(new RegExp(`^${word}$`, 'i')))
              score += 100 * coef
            if (recipe.title.match(new RegExp(`^${word}`, 'i')))
              score += 90 * coef
            if (recipe.title.match(new RegExp(`\\b${word}\\b`, 'i')))
              score += 70 * coef
            if (recipe.title.match(new RegExp(`\\b${word}`, 'i')))
              score += 50 * coef
            if (recipe.title.match(new RegExp(`${word}`, 'i')))
              score += 40 * coef

            if (removeDiacritics(recipe.title).match(new RegExp(`^${word}$`, 'i')))
              score += 95 * coef
            if (removeDiacritics(recipe.title).match(new RegExp(`^${word}`, 'i')))
              score += 85 * coef
            if (removeDiacritics(recipe.title).match(new RegExp(`\\b${word}\\b`, 'i')))
              score += 65 * coef
            if (removeDiacritics(recipe.title).match(new RegExp(`\\b${word}`, 'i')))
              score += 45 * coef
            if (removeDiacritics(recipe.title).match(new RegExp(`${word}`, 'i')))
              score += 35 * coef

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
      .map((recipe) => ({
        ...recipe,
        image: Constants.IMAGE_BASE_URL + recipe.image,
      }))
  },
}