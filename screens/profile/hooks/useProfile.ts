import { ComponentProps, useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import Recipe from "../../../models/recipe.model";
import User from "../../../models/user.model";
import { useAppSelector } from "../../../redux/store";
import ProfileScreen from "../ProfileScreen";

export const useProfile = (params: ComponentProps<typeof ProfileScreen>['route']['params']) => {
  const { user: authenticatedUser } = useAuth();
  const [user, setUser] = useState<User | null>();

  const recipes = useAppSelector((state) => {
    return Recipe.find(state, {
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
      const user = await User.fromGithub(+params.id)
        .catch(() => null);

      setUser(user);
    }

    prepare()
      .catch((err) => console.error(err));
  }, [params]);

  return { user, recipes };
}
