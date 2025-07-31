import { ComponentProps, useEffect, useState } from "react";
import Recipe from "../../../models/recipe.model";
import User from "../../../models/user.model";
import { useAppSelector } from "../../../redux/store";
import Octokit from "../../../utils/octokit/octokit";
import RecipeScreen from "../RecipeScreen";

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
      if (!recipe?.author) return

      const octokit = new Octokit({
        auth: User.client.token,
      });

      const user = await octokit.users.getUser(+recipe.author)
        .then((user) => {
          return new User({
            id: user.id.toString(),
            pseudo: user.login,
            avatar: user.avatar_url,
            name: user.name,
            bio: user.bio,
            location: user.location,
            company: user.company,
            followers: user.followers,
            following: user.following,
            url: user.html_url,
          })
        })
        .catch(() => null);

      setAuthor(user);
    }

    prepare()
      .catch((err) => console.error(err));
  }, [recipe?.author]);

  return { recipe, author };
}
