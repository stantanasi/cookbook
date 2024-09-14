import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SearchFilterQuery } from "../screens/search/SearchScreen";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}

export type RootStackParamList = {
  Home: undefined;
  Recipe: { id: string };
  RecipeCreate: undefined
  RecipeUpdate: { id: string }
  Search: { query: string } & SearchFilterQuery
  Profile: { id: number }
  NotFound: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;
