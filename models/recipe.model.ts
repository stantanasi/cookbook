import { randomUUID } from 'expo-crypto';
import { removeDiacritics } from '../utils/utils'
import Octokit from '../utils/octokit/octokit';
import { Buffer } from 'buffer'
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface IIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface IStep {
  title: string;
  ingredients: IIngredient[];
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
  steps: IStep[];
  createdAt: string;
  updatedAt: string;
}

export default class RecipeModel implements IRecipe {

  id: string = randomUUID()
  title: string = ''
  description: string = ''
  image: string | null = null
  preparationTime: number = 0
  cookingTime: number = 0
  restTime: number = 0
  servings: number = 1
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

    const octokit = new Octokit({
      auth: await AsyncStorage.getItem("github_token") ?? undefined,
    })

    if (this.isModified('image')) {
      const imagePath = `assets/images/recipes/${this.id}.jpg`
      const content = await octokit.repos.getContent(
        'stantanasi',
        'cookbook',
        imagePath,
      )
        .catch(() => null)

      if (this.image === null && content) {
        await octokit.repos.deleteFile(
          'stantanasi',
          'cookbook',
          imagePath,
          {
            message: `feat: delete ${this.title} recipe image`,
            sha: content.sha,
          }
        )
      } else if (this.image) {
        if (this.image.startsWith('data')) {
          this.image = this.image.split(',')[1]
        }

        this.image = await octokit.repos.createOrUpdateFileContents(
          'stantanasi',
          'cookbook',
          imagePath,
          {
            content: this.image,
            message: this.$isNew
              ? `feat: add ${this.title} recipe image`
              : `feat: update ${this.title} recipe image`,
            sha: content?.sha,
          }
        )
          .then((content) => content.content.download_url.replace('main', content.commit.sha))
          .catch(() => this.$original.image ?? null)
      }
    }

    this.updatedAt = (new Date()).toISOString()

    if (this.$isNew) {
      recipes.push(this.toJSON())
    } else {
      const index = recipes.findIndex((recipe) => recipe.id === this.id)
      if (index == -1)
        throw new Error('404')

      recipes[index] = this.toJSON()
    }

    await octokit.repos.getContent(
      'stantanasi',
      'cookbook',
      'data/recipes.json',
    ).then((content) => octokit.repos.createOrUpdateFileContents(
      'stantanasi',
      'cookbook',
      'data/recipes.json',
      {
        content: Buffer.from(JSON.stringify(recipes)).toString('base64'),
        message: this.$isNew
          ? `feat: add ${this.title} recipe`
          : `feat: update ${this.title} recipe`,
        sha: content.sha,
      }
    ))
  }

  async delete() {
    const recipes = await RecipeModel.fetch()

    const index = recipes.findIndex((recipe) => recipe.id === this.id)
    if (index == -1)
      throw new Error('404')

    recipes.splice(index, 1)

    const octokit = new Octokit({
      auth: await AsyncStorage.getItem("github_token") ?? undefined,
    })

    await octokit.repos.getContent(
      'stantanasi',
      'cookbook',
      `assets/images/recipes/${this.id}.jpg`,
    ).then((content) => octokit.repos.deleteFile(
      'stantanasi',
      'cookbook',
      `assets/images/recipes/${this.id}.jpg`,
      {
        message: `feat: delete ${this.title} recipe image`,
        sha: content.sha,
      }
    ))

    await octokit.repos.getContent(
      'stantanasi',
      'cookbook',
      'data/recipes.json',
    ).then((content) => octokit.repos.createOrUpdateFileContents(
      'stantanasi',
      'cookbook',
      'data/recipes.json',
      {
        content: Buffer.from(JSON.stringify(recipes)).toString('base64'),
        message: `feat: delete ${this.title} recipe`,
        sha: content.sha,
      }
    ))
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
      steps: this.steps,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  toJSON(): IRecipe {
    return this.toObject()
  }


  private static recipes: IRecipe[] = []
  static async fetch(): Promise<IRecipe[]> {
    if (this.recipes.length > 0) {
      return this.recipes
    }

    const octokit = new Octokit({
      auth: await AsyncStorage.getItem("github_token") ?? undefined,
    })
    const branch = await octokit.branches.getBranch('stantanasi', 'cookbook', 'main')
    return fetch(`https://raw.githubusercontent.com/stantanasi/cookbook/${branch.commit.sha}/data/recipes.json`)
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