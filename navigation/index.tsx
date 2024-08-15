import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";

import LinkingConfiguration from "./LinkingConfiguration";
import HomeScreen from "../screens/home/HomeScreen";
import RecipeScreen from "../screens/recipe/RecipeScreen";
import { RootStackParamList } from "./types";
import RecipeSaveScreen from "../screens/recipe-save/RecipeSaveScreen";
import NotFoundScreen from "../screens/not-found/NotFoundScreen";
import SearchScreen from "../screens/search/SearchScreen";
import Header from "../components/Header";
import LoginScreen from "../screens/login/LoginScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    AsyncStorage.getItem('github_token')
      .then((value) => setToken(value))
  }, [])

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
        {token && (
          <Stack.Screen
            name="RecipeSave"
            component={RecipeSaveScreen}
          />
        )}
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
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}