import { ComponentProps } from "react";
import Recipe from "../../../models/recipe.model";
import { useAppSelector } from "../../../redux/store";
import SearchScreen from "../SearchScreen";

export const useSearch = (params: ComponentProps<typeof SearchScreen>['route']['params']) => {
  const recipes = useAppSelector((state) => {
    let result = Recipe.search(state, params.query, {
      filter: {
        $and: [
          {
            $or: params.category?.split(',')
              .filter((value) => value)
              .map((value) => ({ category: value }))
              ?? [],
          },
          {
            $or: params.cuisine?.split(',')
              .filter((value) => value)
              .map((value) => ({ cuisine: value }))
              ?? [],
          },
        ],
      },
    });

    if (params.includeIngredients) {
      const includedIngredients = new Set(params.includeIngredients.split(','));
      result = result.filter((recipe) =>
        recipe.steps.some((step) =>
          step.ingredients.some((ingredient) =>
            includedIngredients.has(ingredient.name)
          )
        )
      );
    }

    if (params.excludeIngredients) {
      const excludeIngredients = new Set(params.excludeIngredients.split(','));
      result = result.filter((recipe) =>
        !recipe.steps.some((step) =>
          step.ingredients.some((ingredient) =>
            excludeIngredients.has(ingredient.name)
          )
        )
      );
    }

    if (params.totalTime) {
      result = result.filter((recipe) => {
        const recipeTotalTime = recipe.preparationTime + recipe.cookingTime + recipe.restTime;

        return params.totalTime?.split(',')
          .some((filterTotalTime) => {
            if (filterTotalTime === '30') {
              return recipeTotalTime <= 30;
            } else if (filterTotalTime === '30-60') {
              return recipeTotalTime >= 30 && recipeTotalTime <= 60;
            } else if (filterTotalTime === '60') {
              return recipeTotalTime >= 60;
            } else {
              return false;
            }
          });
      });
    }

    return result;
  });

  return { recipes };
}
