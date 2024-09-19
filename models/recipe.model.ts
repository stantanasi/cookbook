import { model } from '../utils/mongoose/database';
import { STORAGE_BRANCH } from '../utils/mongoose/environment';
import { Model } from '../utils/mongoose/model';
import Schema from '../utils/mongoose/schema';
import { Types } from '../utils/mongoose/types';
import Octokit from '../utils/octokit/octokit';
import CategoryModel, { ICategory } from './category.model';
import CuisineModel, { ICuisine } from './cuisine.model';
import UserModel, { IUser } from './user.model';

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
  id: Types.ObjectId;

  title: string;
  description: string;
  image: string | null;
  category: Types.ObjectId | Model<ICategory>
  cuisine: Types.ObjectId | Model<ICuisine>
  preparationTime: number;
  cookingTime: number;
  restTime: number
  servings: number
  steps: IStep[];
  author: number | Model<IUser>

  createdAt: string;
  updatedAt: string;
}


const RecipeSchema = new Schema<IRecipe>({
  title: {
    default: '',
    searchable: true,
    transform: function (val) {
      return val.trim()
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
    ref: () => CategoryModel,
  },

  cuisine: {
    default: undefined,
    ref: () => CuisineModel,
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
    ref: () => UserModel,
  },
}, {
  timestamps: true,
})

RecipeSchema.pre('save', async function (options) {
  if (options?.asDraft) return

  const octokit = new Octokit({
    auth: this.model().db.token,
  })

  if ((this.isNew && this.image) || this.isModified('image')) {
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
    auth: this.model().db.token,
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


const RecipeModel = model<IRecipe>(RecipeSchema, 'recipes')
export default RecipeModel
