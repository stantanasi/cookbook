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
}