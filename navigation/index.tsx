import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SplashScreen from 'expo-splash-screen';
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
import { Image, Platform } from "react-native";

const Stack = createNativeStackNavigator<RootStackParamList>();

SplashScreen.preventAutoHideAsync();

export default function Navigation() {
  const [isAppReady, setAppIsReady] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const prepare = async () => {
      await AsyncStorage.getItem('github_token')
        .then((value) => setToken(value))
    }

    prepare()
      .catch((err) => console.error(err))
      .finally(() => {
        setAppIsReady(true)
        SplashScreen.hideAsync()
      })
  }, [])

  if (!isAppReady) {
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