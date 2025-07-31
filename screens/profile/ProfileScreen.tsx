import { StackActions, StaticScreenProps, useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import slugify from 'slugify';
import ExpandableFloatingActionButton from '../../components/molecules/ExpandableFloatingActionButton';
import RecipeCard from '../../components/molecules/RecipeCard';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../loading/LoadingScreen';
import NotFoundScreen from '../not-found/NotFoundScreen';
import Footer from './components/Footer';
import Header from './components/Header';
import { useProfile } from './hooks/useProfile';

type Props = StaticScreenProps<{
  id: string
}>

export default function ProfileScreen({ route }: Props) {
  const navigation = useNavigation()
  const { user: authenticatedUser, logout } = useAuth()
  const { user, recipes } = useProfile(route.params)

  useEffect(() => {
    if (!user) {
      navigation.setOptions({
        title: 'Page non trouvée',
      })

      return
    }

    navigation.setOptions({
      title: `${user.pseudo}${user.name ? ` (${user.name})` : ''}`,
    })
  }, [user])

  if (user === undefined || recipes === undefined) {
    return <LoadingScreen />
  }
  if (user === null || recipes === null) {
    return <NotFoundScreen route={{ params: undefined }} />
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onPress={() => navigation.navigate('Recipe', {
              id: `${item.id}-${slugify(item.title, { lower: true })}`,
            })}
            style={styles.recipe}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListHeaderComponent={Header({
          authenticatedUser: authenticatedUser,
          user: user,
          recipes: recipes,
          onLogout: () => {
            logout()
              .then(() => {
                if (navigation.canGoBack()) {
                  navigation.goBack()
                } else {
                  navigation.dispatch(
                    StackActions.replace('Home')
                  )
                }
              })
          },
        })}
        ListFooterComponent={Footer()}
      />

      {(authenticatedUser && user.id == authenticatedUser.id) && (
        <ExpandableFloatingActionButton
          icon="add"
          menuItems={[
            {
              icon: 'menu-book',
              label: 'Recette',
              onPress: () => navigation.navigate('RecipeCreate'),
            },
            {
              icon: 'flatware',
              label: 'Cuisine',
              onPress: () => navigation.navigate('CuisineCreate'),
            },
          ]}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  recipe: {
    marginHorizontal: 16,
  },
})