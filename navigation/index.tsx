import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SplashScreen from 'expo-splash-screen';
import { useContext, useEffect, useState } from "react";
import { Image, Platform } from "react-native";
import Header, { HeaderFilterQuery } from "../components/organisms/Header";
import { AuthContext } from "../contexts/AuthContext";
import CategoryModel from "../models/category.model";
import CuisineModel from "../models/cuisine.model";
import RecipeModel from "../models/recipe.model";
import HomeScreen from "../screens/home/HomeScreen";
import NotFoundScreen from "../screens/not-found/NotFoundScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import RecipeSaveScreen from "../screens/recipe-save/RecipeSaveScreen";
import RecipeScreen from "../screens/recipe/RecipeScreen";
import SearchScreen from "../screens/search/SearchScreen";
import LinkingConfiguration from "./LinkingConfiguration";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

SplashScreen.preventAutoHideAsync();

export default function Navigation() {
  const { isReady: isAuthReady, isAuthenticated } = useContext(AuthContext)
  const [isAppReady, setAppIsReady] = useState(false);
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<HeaderFilterQuery>({})

  useEffect(() => {
    setAppIsReady(false)

    Promise.all([
      CategoryModel.fetch(),
      CuisineModel.fetch(),
      RecipeModel.fetch(),
    ])
      .catch((err) => console.error(err))
      .finally(() => setAppIsReady(true))
  }, [])

  useEffect(() => {
    if (isAuthReady && isAppReady) {
      SplashScreen.hideAsync()
    }
  }, [isAuthReady, isAppReady])

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
          header: (props) => <Header
            {...props}
            query={query}
            onChangeQuery={(query) => setQuery(query)}
            filter={filter}
            onChangeFilter={(filter) => {
              Object.entries(filter).forEach(([key, values]) => {
                if (values.length === 0) {
                  delete filter[key as keyof HeaderFilterQuery]
                }
              })
              setFilter(filter)
            }}
          />,
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
        {isAuthenticated && (<>
          <Stack.Screen
            name="RecipeCreate"
            component={RecipeSaveScreen}
          />
          <Stack.Screen
            name="RecipeUpdate"
            component={RecipeSaveScreen}
          />
        </>)}
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
            title: `Recettes ${route.params.query}`,
          })}
          listeners={({ route }) => ({
            focus: () => {
              const { query } = route.params
              setQuery(query)
            }
          })}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}