export interface IRecipe {
  id: string;
  title: string;
  description: string;
  image: any;
  preparationTime: number;
  cookingTime: number;
  ingredients: {
    title: string;
    items: {
      quantity: number;
      unit: string;
      name: string;
      image?: string;
    }[];
  }[];
  steps: {
    title: string;
    actions: string[];
  }[];
  createdAt: string;
  updatedAt: string;
}
