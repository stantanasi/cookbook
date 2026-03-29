import { ComponentProps, useMemo } from 'react';
import Recipe from '../../../models/recipe.model';
import { useAppSelector } from '../../../redux/store';
import HomeScreen from '../HomeScreen';

export const useHome = (params: ComponentProps<typeof HomeScreen>['route']['params']) => {
  const allRecipes = useAppSelector((state) => {
    return Recipe.find(state, {
      filter: { isDraft: false },
      sort: { updatedAt: 'descending' },
    });
  });

  const recipes = useMemo(() => {
    const today = new Date().getDate();

    const featured = [...allRecipes]
      .sort((a, b) => (+a.id * today * 31) % 100 - (+b.id * today * 31) % 100)
      .slice(0, 4);

    const quick = allRecipes
      .filter((recipe) => (recipe.preparationTime + recipe.cookingTime + recipe.restTime) <= 30)
      .slice(0, 8);

    const main = allRecipes
      .filter((recipe) => recipe.category === '5322f4a9-7108-4ec4-88cd-02e03157d6b9')
      .slice(0, 8);

    const desserts = allRecipes
      .filter((recipe) => recipe.category === '86eb9ddb-0587-4bf7-a9dc-a0e8e5182aad')
      .slice(0, 8);

    const caribbean = allRecipes
      .filter((recipe) => recipe.cuisine === '47d831c1-1732-4031-94c8-414f935e77ca')
      .slice(0, 8);

    const latest = allRecipes
      .slice(0, 8);

    return {
      featured,
      quick,
      main,
      desserts,
      caribbean,
      latest,
    };
  }, [allRecipes]);

  return {
    recipes,
  };
};
