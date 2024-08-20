import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SplashScreen from 'expo-splash-screen';
import { useContext, useEffect, useState } from "react";

import LinkingConfiguration from "./LinkingConfiguration";
import HomeScreen from "../screens/home/HomeScreen";
import RecipeScreen from "../screens/recipe/RecipeScreen";
import { RootStackParamList } from "./types";
import RecipeSaveScreen from "../screens/recipe-save/RecipeSaveScreen";
import NotFoundScreen from "../screens/not-found/NotFoundScreen";
import SearchScreen from "../screens/search/SearchScreen";
import Header from "../components/Header";
import LoginScreen from "../screens/login/LoginScreen";
import { AuthContext } from "../contexts/AuthContext";
import { Image, Platform } from "react-native";
import RecipeModel from "../models/recipe.model";
import ProfileScreen from "../screens/profile/ProfileScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

SplashScreen.preventAutoHideAsync();

export default function Navigation() {
  const { isReady: isAuthReady, isAuthenticated } = useContext(AuthContext)
  const [isAppReady, setAppIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      await RecipeModel.fetch()
    }

    prepare()
      .catch((err) => console.error(err))
      .finally(() => {
        setAppIsReady(true)
        SplashScreen.hideAsync()
      })
  }, [])

  if (!isAuthReady || !isAppReady) {
    if (Platform.OS === 'web') {
      return (
        <Image
          source={require('../assets/splash.png')}
          resizeMode="contain"
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#ffffff',
          }}
        />
      )
    } else {
      return null
    }
  }

  return (
    <NavigationContainer
      linking={LinkingConfiguration}
    >
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          contentStyle: { backgroundColor: '#fff' },
          header: (props) => <Header {...props} />,
          title: 'Cookbook',
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
        {isAuthenticated && (
          <Stack.Screen
            name="RecipeSave"
            component={RecipeSaveScreen}
          />
        )}
        <Stack.Screen
          name="NotFound"
          component={NotFoundScreen}
          options={{
            title: 'Page non trouvée',
          }}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={({ route }) => ({
            header: (props) => <Header query={route.params.query} {...props} />,
            title: `Recettes ${route.params.query}`,
          })}
        />
        {isAuthenticated ? (
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={() => ({
              title: 'Mon profil',
            })}
          />
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              title: 'Connexion',
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}