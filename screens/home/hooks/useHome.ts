import { ComponentProps, useState } from "react";
import Category, { CATEGORY_ALL } from "../../../models/category.model";
import Recipe from "../../../models/recipe.model";
import { useAppSelector } from "../../../redux/store";
import HomeScreen from "../HomeScreen";

export const useHome = (params: ComponentProps<typeof HomeScreen>['route']['params']) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>(CATEGORY_ALL);

  const categories = useAppSelector((state) => {
    return Category.find(state);
  });

  const recipes = useAppSelector((state) => {
    return Recipe.find(state, {
      filter: {
        ...{ isNew: false },
        ...(!!selectedCategory.id && { category: selectedCategory.id }),
      },
      sort: {
        updatedAt: 'descending',
      },
    });
  });

  return {
    categories: [
      CATEGORY_ALL,
      ...categories,
    ],
    recipes,
    selectedCategory,
    setSelectedCategory,
  };
};
