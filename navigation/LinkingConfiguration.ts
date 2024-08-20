import { LinkingOptions } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { RootStackParamList } from "./types";

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
      RecipeSave: {
        path: 'cookbook/recipe/:id/edit',
      },
      Search: {
        path: 'cookbook/search',
      },
      Login: {
        path: 'cookbook/login',
      },
      Profile: {
        path: 'cookbook/profile',
      },
      NotFound: {
        path: 'cookbook/*',
      },
    },
  },
};

export default linking;