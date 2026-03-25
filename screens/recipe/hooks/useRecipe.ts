import { ComponentProps, useEffect } from 'react';
import Recipe from '../../../models/recipe.model';
import User from '../../../models/user.model';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import RecipeScreen from '../RecipeScreen';

export const useRecipe = (params: ComponentProps<typeof RecipeScreen>['route']['params']) => {
  const dispatch = useAppDispatch();

  const recipe = useAppSelector((state) => {
    return Recipe.findById(state, params.id.split('-')[0], {
      include: {
        category: true,
        cuisine: true,
      },
    });
  });

  const author = useAppSelector((state) => {
    if (!recipe?.author) return;

    return User.findById(state, recipe.author as string);
  });

  useEffect(() => {
    const prepare = async () => {
      if (!recipe?.author) return;

      const user = await User.fromGithub(+recipe.author);

      dispatch(User.slice.actions.setOne(user.toJSON()));
    };

    prepare()
      .catch((err) => console.error(err));
  }, [recipe?.author]);

  return { recipe, author };
};
