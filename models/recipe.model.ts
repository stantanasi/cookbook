import { model, STORAGE_BRANCH } from '../utils/database/database';
import Schema from '../utils/database/schema';
import Octokit from '../utils/octokit/octokit';

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
  author: number

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
        actions: step.actions.map((action) => action.trim())
      }))
    }
  },

  author: {
    default: 0,
  },
}, {
  timestamps: true,
})

RecipeSchema.pre('save', async function () {
  const octokit = new Octokit({
    auth: this.model().db.token,
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
          message: `feat(${this.model().collection}.json): delete ${this.id} image`,
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
          message: `feat(${this.model().collection}.json): ${this.isNew ? 'add' : 'update'} ${this.id} image`,
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
        message: `feat(${this.model().collection}.json): delete ${this.id} image`,
        sha: content.sha,
        branch: STORAGE_BRANCH,
      }
    ))
    .catch((err) => console.error(err))
})


const RecipeModel = model<IRecipe>(RecipeSchema, 'recipes')
export default RecipeModel
