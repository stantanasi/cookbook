import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LinkingConfiguration from "./LinkingConfiguration";
import HomeScreen from "../screens/home/HomeScreen";
import RecipeScreen from "../screens/recipe/RecipeScreen";
import { RootStackParamList } from "./types";
import RecipeSaveScreen from "../screens/recipe-save/RecipeSaveScreen";

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
      </Stack.Navigator>
    </NavigationContainer>
  );
}