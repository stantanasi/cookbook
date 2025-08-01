import { ComponentProps, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import Category from "../../../models/category.model";
import Cuisine from "../../../models/cuisine.model";
import Recipe, { IRecipe } from "../../../models/recipe.model";
import { useAppSelector } from "../../../redux/store";
import RecipeSaveScreen from "../RecipeSaveScreen";

export const useRecipeSave = (params: ComponentProps<typeof RecipeSaveScreen>['route']['params']) => {
  const { user } = useAuth();
  const [form, setForm] = useState<IRecipe>(undefined as any);

  const categories = useAppSelector((state) => {
    return Category.find(state);
  });

  const cuisines = useAppSelector((state) => {
    return Cuisine.find(state, {
      sort: { name: 'asc' },
    });
  });

  const recipes = useAppSelector((state) => {
    return Recipe.find(state);
  });

  const recipe = (() => {
    if (!params) {
      return useMemo(() => new Recipe({
        id: (Math.max(...recipes.map((recipe) => +recipe.id)) + 1).toString(),
        author: user!.id,
      }), [params]);
    }

    return useAppSelector((state) => {
      return Recipe.findById(state, params.id.split('-')[0]);
    });
  })();

  useEffect(() => {
    if (!recipe || form) return;
    setForm(recipe.toObject());
  }, [recipe]);

  return { categories, cuisines, recipe, form, setForm };
};
