import { createStaticNavigation, StaticParamList } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as Linking from "expo-linking"
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useEffect, useState } from 'react'
import { Image, Platform } from 'react-native'
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Provider } from 'react-redux'
import { Toaster } from 'sonner'
import Header from './components/organisms/Header'
import AuthProvider, { useAuth } from './contexts/AuthContext'
import HeaderProvider from './contexts/HeaderContext'
import Category from './models/category.model'
import Cuisine from './models/cuisine.model'
import Recipe from './models/recipe.model'
import store, { useAppDispatch } from './redux/store'
import CuisineSaveScreen from './screens/cuisine-save/CuisineSaveScreen'
import HomeScreen from './screens/home/HomeScreen'
import NotFoundScreen from './screens/not-found/NotFoundScreen'
import ProfileScreen from './screens/profile/ProfileScreen'
import RecipeSaveScreen from './screens/recipe-save/RecipeSaveScreen'
import RecipeScreen from './screens/recipe/RecipeScreen'
import SearchScreen from './screens/search/SearchScreen'

const RootStack = createNativeStackNavigator({
  initialRouteName: 'Home',
  screenOptions: {
    title: 'Cookbook',
    contentStyle: { backgroundColor: '#fff' },
    header: (props) => (
      <Header {...props} />
    ),
  },
  screens: {
    Home: {
      screen: HomeScreen,
      linking: {
        path: 'cookbook',
      },
    },
    Recipe: {
      screen: RecipeScreen,
      linking: {
        path: 'cookbook/recipe/:id',
      },
    },
    RecipeCreate: {
      if: () => {
        const { isAuthenticated } = useAuth()
        return isAuthenticated
      },
      screen: RecipeSaveScreen,
      linking: {
        path: 'cookbook/recipe/add',
      },
    },
    RecipeUpdate: {
      if: () => {
        const { isAuthenticated } = useAuth()
        return isAuthenticated
      },
      screen: RecipeSaveScreen,
      linking: {
        path: 'cookbook/recipe/:id/edit',
      },
    },
    Search: {
      screen: SearchScreen,
      linking: {
        path: 'cookbook/search',
      },
    },
    Profile: {
      screen: ProfileScreen,
      linking: {
        path: 'cookbook/profile/:id',
      },
    },
    CuisineCreate: {
      if: () => {
        const { isAuthenticated } = useAuth()
        return isAuthenticated
      },
      screen: CuisineSaveScreen,
      linking: {
        path: 'cookbook/cuisine/add',
      },
    },
    NotFound: {
      screen: NotFoundScreen,
      options: {
        title: 'Page non trouvée',
      },
      linking: {
        path: 'cookbook/*',
      },
    },
  },
})

type RootStackParamList = StaticParamList<typeof RootStack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}

const Navigation = createStaticNavigation(RootStack)

SplashScreen.preventAutoHideAsync()

function AppContent() {
  const dispatch = useAppDispatch()
  const { isReady: isAuthReady } = useAuth()
  const [isAppReady, setAppIsReady] = useState(false)

  useEffect(() => {
    setAppIsReady(false)

    if (!isAuthReady) return

    Promise.all([
      Category.fetch(dispatch),
      Cuisine.fetch(dispatch),
      Recipe.fetch(dispatch),
    ])
      .catch((err) => console.error(err))
      .finally(() => setAppIsReady(true))
  }, [isAuthReady])

  const onLayoutRootView = useCallback(() => {
    if (isAuthReady && isAppReady) {
      SplashScreen.hideAsync()
    }
  }, [isAuthReady, isAppReady])

  if (!isAuthReady || !isAppReady) {
    if (Platform.OS === 'web') {
      return (
        <Image
          source={require('./assets/splash.png')}
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
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <Navigation
        linking={{
          prefixes: [Linking.createURL("/")],
        }}
      />
      <Toaster />
      <StatusBar />
    </SafeAreaProvider>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <HeaderProvider>
          <AppContent />
        </HeaderProvider>
      </AuthProvider>
    </Provider>
  )
}
