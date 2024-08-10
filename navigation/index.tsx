import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LinkingConfiguration from "./LinkingConfiguration";
import HomeScreen from "../screens/home/HomeScreen";
import RecipeScreen from "../screens/recipe/RecipeScreen";
import { RootStackParamList } from "./types";
import RecipeSaveScreen from "../screens/recipe-save/RecipeSaveScreen";
import NotFoundScreen from "../screens/not-found/NotFoundScreen";
import SearchScreen from "../screens/search/SearchScreen";
import Header from "../components/Header";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
    >
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          contentStyle: { backgroundColor: '#fff' },
          header: (props) => <Header {...props} />,
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />
        <Stack.Screen
          name="Recipe"
          component={RecipeScreen}
        />
        <Stack.Screen
          name="RecipeSave"
          component={RecipeSaveScreen}
        />
        <Stack.Screen
          name="NotFound"
          component={NotFoundScreen}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={({ route }) => ({
            header: (props) => <Header query={route.params.query} {...props} />,
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}