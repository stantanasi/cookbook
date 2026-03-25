import { model, Schema } from '../utils/database';
import Category from './category.model';
import Cuisine from './cuisine.model';
import User from './user.model';

export interface IIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface IInstruction {
  description: string;
}

export interface IStep {
  title: string;
  ingredients: IIngredient[];
  instructions: IInstruction[];
}

export interface IRecipe {
  id: string;

  title: string;
  description: string;
  image: string | null;
  category: string | Category;
  cuisine: string | Cuisine;
  preparationTime: number;
  cookingTime: number;
  restTime: number;
  servings: number;
  steps: IStep[];
  author: string | User;

  createdAt: string;
  updatedAt: string;
}


const RecipeSchema = new Schema<IRecipe>({
  id: {},

  title: {
    default: '',
    searchable: true,
    transform: function (val) {
      return val.trim();
    },
    validate: function (val) {
      return val.length > 0;
    },
  },

  description: {
    default: '',
    transform: function (val) {
      return val.trim();
    },
  },

  image: {
    type: 'image',
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
      }));
    }
  },

  author: {
    default: undefined,
    ref: 'User',
  },
}, {
  timestamps: true,
});


class Recipe extends model<IRecipe>(RecipeSchema, 'recipes') { }

Recipe.register('Recipe');

export default Recipe;
