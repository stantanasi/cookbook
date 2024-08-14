import { v4 as uuidv4 } from 'uuid'
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
    const recipes = await RecipeModel.fetch()

    this.updatedAt = (new Date()).toISOString()

    if (this.$isNew) {
      recipes.push(this.toJSON())
    } else {
      const index = recipes.findIndex((recipe) => recipe.id === this.id)
      if (index == -1)
        throw new Error('404')

      recipes[index] = this.toJSON()
    }
  }

  async delete() {
    const recipes = await RecipeModel.fetch()

    const index = recipes.findIndex((recipe) => recipe.id === this.id)
    if (index == -1)
      throw new Error('404')

    recipes.splice(index, 1)
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


  private static recipes: IRecipe[] = []
  private static async fetch(): Promise<IRecipe[]> {
    if (this.recipes.length > 0) {
      return this.recipes
    }

    return fetch('https://raw.githubusercontent.com/stantanasi/cookbook/main/data/recipes.json')
      .then((res) => res.json())
      .then((data) => {
        this.recipes = data
        return this.recipes
      })
  }

  static async find(): Promise<RecipeModel[]> {
    const recipes = await this.fetch()

    return recipes
      .map((recipe) => new RecipeModel(recipe, { isNew: false }))
  }

  static async search(query: string): Promise<RecipeModel[]> {
    const recipes = await this.fetch()

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

  static async findById(id: string): Promise<RecipeModel | null> {
    const recipes = await this.fetch()

    const recipe = recipes.find((recipe) => recipe.id == id)

    if (recipe) {
      return new RecipeModel(recipe, { isNew: false })
    }

    return null
  }
}