import { v4 as uuidv4 } from 'uuid'
import recipesJSON from '../data/recipes.json'
import { removeDiacritics } from '../utils/utils'

export interface IIngredient {
  title: string;
  items: IIngredientItem[];
}

export interface IIngredientItem {
  quantity: number;
  unit: string;
  name: string;
  image?: string;
}

export interface IStep {
  title: string;
  actions: string[];
}

export interface IRecipe {
  id: string;
  title: string;
  description: string;
  image: string | null;
  preparationTime: number;
  cookingTime: number;
  restTime: number
  servings: number
  ingredients: IIngredient[];
  steps: IStep[];
  createdAt: string;
  updatedAt: string;
}

export default class RecipeModel implements IRecipe {

  id: string = uuidv4()
  title: string = ''
  description: string = ''
  image: string | null = null
  preparationTime: number = 0
  cookingTime: number = 0
  restTime: number = 0
  servings: number = 0
  ingredients: IIngredient[] = []
  steps: IStep[] = []
  createdAt: string = (new Date()).toISOString()
  updatedAt: string = (new Date()).toISOString()

  private $original: Partial<IRecipe> = {}
  private $isNew: boolean = true

  constructor(
    data?: Partial<IRecipe>,
    options?: {
      isNew?: boolean,
    },
  ) {
    options = Object.assign({}, options)

    // Avoid setting `isNew` to `true`, because it is `true` by default
    if (options.isNew != null && options.isNew !== true) {
      this.$isNew = options.isNew;
    }

    if (!this.$isNew) {
      this.$original = Object.assign({}, data)
    }

    Object.assign(this, data)
  }

  assign(data: Partial<IRecipe>): this {
    return Object.assign(this, data)
  }

  async save() {
    this.updatedAt = (new Date()).toISOString()

    if (this.$isNew) {
      recipesJSON.push(this.toJSON() as any)
    } else {
      const index = recipesJSON.findIndex((recipe) => recipe.id === this.id)
      if (index == -1)
        throw new Error('404')

      recipesJSON[index] = this.toJSON() as any
    }
  }

  async delete() {
    const index = recipesJSON.findIndex((recipe) => recipe.id === this.id)
    if (index == -1)
      throw new Error('404 is not saved yet')

    recipesJSON.splice(index, 1)
  }

  isModified<T extends keyof IRecipe>(path?: T): boolean {
    if (path) {
      return this[path] !== this.$original[path]
    }

    return JSON.stringify(this.toJSON()) == JSON.stringify(this.$original)
  }

  toObject(): IRecipe {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      image: this.image,
      preparationTime: this.preparationTime,
      cookingTime: this.cookingTime,
      restTime: this.restTime,
      servings: this.servings,
      ingredients: this.ingredients,
      steps: this.steps,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  toJSON(): IRecipe {
    return this.toObject()
  }


  static find(): RecipeModel[] {
    return recipesJSON
      .map((recipe) => new RecipeModel(recipe, { isNew: false }))
  }

  static search(query: string): RecipeModel[] {
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
      .map((recipe) => new RecipeModel(recipe, { isNew: false }))
  }

  static findById(id: string): RecipeModel | null {
    const recipe = recipesJSON.find((recipe) => recipe.id == id)

    if (recipe) {
      return new RecipeModel(recipe, { isNew: false })
    }

    return null
  }
}