import { getPathFromState, getStateFromPath, LinkingOptions } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { RootStackParamList } from "./types";

const getLinkingPathOptions = (): Pick<LinkingOptions<RootStackParamList>, 'getPathFromState' | 'getStateFromPath'> => {
  let currentUrl = ''

  return {
    getStateFromPath: (path, config) => {
      currentUrl = path
      return getStateFromPath(currentUrl, config)
    },
    getPathFromState: (state, config) => {
      const path = getPathFromState(state, config)

      return path === '/cookbook/NotFound'
        ? currentUrl
        : path
    },
  }
}

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL("/")],
  config: {
    screens: {
      Home: {
        path: 'cookbook',
      },
      Recipe: {
        path: 'cookbook/recipe/:id',
      },
      RecipeCreate: {
        path: 'cookbook/recipe/add',
      },
      RecipeUpdate: {
        path: 'cookbook/recipe/:id/edit',
      },
      Search: {
        path: 'cookbook/search',
      },
      Profile: {
        path: 'cookbook/profile/:id',
      },
      NotFound: {
        path: 'cookbook/*',
      },
    },
  },
  ...getLinkingPathOptions(),
};

export default linking;