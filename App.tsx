import { createStaticNavigation, StaticParamList } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useContext, useEffect, useState } from 'react'
import { Image, Platform } from 'react-native'
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Toaster } from 'sonner'
import Header from './components/organisms/Header'
import AuthProvider, { AuthContext } from './contexts/AuthContext'
import Category from './models/category.model'
import Cuisine from './models/cuisine.model'
import Recipe from './models/recipe.model'

const RootStack = createNativeStackNavigator({
  screenOptions: {
    header: (props) => (
      <Header {...props} />
    ),
  },
  screens: {
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
  const { isReady: isAuthReady } = useContext(AuthContext)
  const [isAppReady, setAppIsReady] = useState(false)

  useEffect(() => {
    setAppIsReady(false)

    Promise.all([
      Category.fetch(),
      Cuisine.fetch(),
      Recipe.fetch(),
    ])
      .catch((err) => console.error(err))
      .finally(() => setAppIsReady(true))
  }, [])

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
      <Navigation />
      <Toaster />
      <StatusBar />
    </SafeAreaProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
