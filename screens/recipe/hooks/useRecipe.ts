import { ComponentProps, useEffect, useState } from 'react';
import Recipe from '../../../models/recipe.model';
import User from '../../../models/user.model';
import { useAppSelector } from '../../../redux/store';
import RecipeScreen from '../RecipeScreen';

export const useRecipe = (params: ComponentProps<typeof RecipeScreen>['route']['params']) => {
  const [author, setAuthor] = useState<User | null>();

  const recipe = useAppSelector((state) => {
    return Recipe.findById(state, params.id.split('-')[0], {
      include: {
        category: true,
        cuisine: true,
      },
    });
  });

  useEffect(() => {
    const prepare = async () => {
      if (!recipe?.author) return;

      const user = await User.fromGithub(+recipe.author)
        .catch(() => null);

      setAuthor(user);
    };

    prepare()
      .catch((err) => console.error(err));
  }, [recipe?.author]);

  return { recipe, author };
};
