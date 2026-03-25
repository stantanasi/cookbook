import { createStaticNavigation, StaticParamList } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect } from 'react';
import { Image, Platform, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from 'sonner';
import Header from './components/organisms/Header';
import AppProvider, { useApp } from './contexts/AppContext';
import AuthProvider, { useAuth } from './contexts/AuthContext';
import HeaderProvider from './contexts/HeaderContext';
import store, { persistor } from './redux/store';
import CuisineSaveScreen from './screens/cuisine-save/CuisineSaveScreen';
import HomeScreen from './screens/home/HomeScreen';
import NotFoundScreen from './screens/not-found/NotFoundScreen';
import ProfileScreen from './screens/profile/ProfileScreen';
import RecipeSaveScreen from './screens/recipe-save/RecipeSaveScreen';
import RecipeScreen from './screens/recipe/RecipeScreen';
import SearchScreen from './screens/search/SearchScreen';

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
        const { isAuthenticated } = useAuth();
        return isAuthenticated;
      },
      screen: RecipeSaveScreen,
      linking: {
        path: 'cookbook/recipe/add',
      },
    },
    RecipeUpdate: {
      if: () => {
        const { isAuthenticated } = useAuth();
        return isAuthenticated;
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
        const { isAuthenticated } = useAuth();
        return isAuthenticated;
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
});

type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}

const Navigation = createStaticNavigation(RootStack);

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { isReady: isAppReady, isOffline: isAppOffline, sync: syncApp } = useApp();
  const { isReady: isAuthReady } = useAuth();

  useEffect(() => {
    if (!isAuthReady) return;

    syncApp();
  }, [isAuthReady]);

  const onLayoutRootView = useCallback(() => {
    if (isAuthReady && isAppReady) {
      SplashScreen.hideAsync();
    }
  }, [isAuthReady, isAppReady]);

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
      );
    } else {
      return null;
    }
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <Navigation
        linking={{
          prefixes: [Linking.createURL('/')],
        }}
      />

      {isAppOffline && (
        <View
          style={{
            backgroundColor: '#fb743d',
          }}
        >
          <Text
            style={{
              color: '#ffffff',
              padding: 3,
              textAlign: 'center',
            }}
          >
            Vous êtes en mode hors connexion
          </Text>
        </View>
      )}
      <Toaster />
      <StatusBar />
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppProvider>
          <AuthProvider>
            <HeaderProvider>
              <AppContent />
            </HeaderProvider>
          </AuthProvider>
        </AppProvider>
      </PersistGate>
    </Provider>
  );
}
