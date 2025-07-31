import { ComponentProps, useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import Recipe from "../../../models/recipe.model";
import User from "../../../models/user.model";
import { useAppSelector } from "../../../redux/store";
import Octokit from "../../../utils/octokit/octokit";
import ProfileScreen from "../ProfileScreen";

export const useProfile = (params: ComponentProps<typeof ProfileScreen>['route']['params']) => {
  const { user: authenticatedUser } = useAuth();
  const [user, setUser] = useState<User | null>();

  const recipes = useAppSelector((state) => {
    return Recipe.findRedux(state, {
      filter: {
        author: params.id,
        ...(authenticatedUser?.id !== params.id && { isDraft: false }),
      },
      sort: {
        updatedAt: 'descending',
      },
    });
  });

  useEffect(() => {
    const prepare = async () => {
      const octokit = new Octokit({
        auth: User.client.token,
      });

      const user = await octokit.users.getUser(+params.id)
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

      setUser(user);
    }

    prepare()
      .catch((err) => console.error(err));
  }, [params]);

  return { user, recipes };
}
