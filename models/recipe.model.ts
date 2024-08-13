import { v4 as uuidv4 } from 'uuid'

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
}