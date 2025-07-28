import { model, Schema, STORAGE_BRANCH, Types } from '../utils/database';
import Octokit from '../utils/octokit/octokit';
import Category from './category.model';
import Cuisine from './cuisine.model';
import User from './user.model';

export interface IIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface IInstruction {
  description: string
}

export interface IStep {
  title: string;
  ingredients: IIngredient[];
  instructions: IInstruction[];
}

export interface IRecipe {
  id: number;

  title: string;
  description: string;
  image: string | null;
  category: Types.ObjectId | Category
  cuisine: Types.ObjectId | Cuisine
  preparationTime: number;
  cookingTime: number;
  restTime: number
  servings: number
  steps: IStep[];
  author: number | User

  createdAt: string;
  updatedAt: string;
}


const RecipeSchema = new Schema<IRecipe>({
  id: {},

  title: {
    default: '',
    searchable: true,
    transform: function (val) {
      return val.trim()
    },
    validate: function (val) {
      return val.length > 0
    },
  },

  description: {
    default: '',
    transform: function (val) {
      return val.trim()
    },
  },

  image: {
    default: null,
  },

  category: {
    default: undefined,
    ref: 'Category',
  },

  cuisine: {
    default: undefined,
    ref: 'Cuisine',
  },

  preparationTime: {
    default: 0,
  },

  cookingTime: {
    default: 0,
  },

  restTime: {
    default: 0,
  },

  servings: {
    default: 1,
  },

  steps: {
    default: [],
    transform: function (val) {
      return val.map((step) => ({
        title: step.title.trim(),
        ingredients: step.ingredients.map((ingredient) => ({
          name: ingredient.name.trim(),
          quantity: ingredient.quantity,
          unit: ingredient.unit.trim(),
        })),
        instructions: step.instructions.map((instruction) => ({
          description: instruction.description.trim(),
        }))
      }))
    }
  },

  author: {
    default: undefined,
    ref: 'User',
  },
}, {
  timestamps: true,
})

RecipeSchema.pre('save', async function (options) {
  if (options?.asDraft) return

  const octokit = new Octokit({
    auth: this.model().client.token,
  })

  if (this.isModified('image')) {
    const imagePath = `${this.model().collection}/${this.id}.jpg`
    const content = await octokit.repos.getContent(
      'stantanasi',
      'cookbook',
      imagePath,
      STORAGE_BRANCH,
    )
      .catch(() => null)

    if (this.image === null && content) {
      await octokit.repos.deleteFile(
        'stantanasi',
        'cookbook',
        imagePath,
        {
          message: `feat(${this.model().collection}): delete ${this.id} image`,
          sha: content.sha,
          branch: STORAGE_BRANCH,
        }
      )
    } else if (this.image) {
      if (this.image.startsWith('data')) {
        this.image = this.image.split(',')[1]
      }

      await octokit.repos.createOrUpdateFileContents(
        'stantanasi',
        'cookbook',
        imagePath,
        {
          content: this.image,
          message: `feat(${this.model().collection}): ${content ? 'update' : 'add'} ${this.id} image`,
          sha: content?.sha,
          branch: STORAGE_BRANCH,
        }
      )
        .then((content) => {
          this.image = content.content.download_url.replace(STORAGE_BRANCH, content.commit.sha)
        })
    }
  }
})

RecipeSchema.pre('delete', async function () {
  if (this.isDraft) return

  const octokit = new Octokit({
    auth: this.model().client.token,
  })

  await octokit.repos.getContent(
    'stantanasi',
    'cookbook',
    `${this.model().collection}/${this.id}.jpg`,
    STORAGE_BRANCH,
  )
    .then((content) => octokit.repos.deleteFile(
      'stantanasi',
      'cookbook',
      `${this.model().collection}/${this.id}.jpg`,
      {
        message: `feat(${this.model().collection}): delete ${this.id} image`,
        sha: content.sha,
        branch: STORAGE_BRANCH,
      }
    ))
    .catch((err) => console.error(err))
})


class Recipe extends model<IRecipe>(RecipeSchema, 'recipes') { }

Recipe.register('Recipe')

export default Recipe
