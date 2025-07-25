import { StackActions, StaticScreenProps, useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import slugify from 'slugify';
import ExpandableFloatingActionButton from '../../components/molecules/ExpandableFloatingActionButton';
import RecipeCard from '../../components/molecules/RecipeCard';
import { AuthContext } from '../../contexts/AuthContext';
import Recipe from '../../models/recipe.model';
import User from '../../models/user.model';
import LoadingScreen from '../loading/LoadingScreen';
import NotFoundScreen from '../not-found/NotFoundScreen';
import Footer from './components/Footer';
import Header from './components/Header';

type Props = StaticScreenProps<{
  id: number
}>

export default function ProfileScreen({ route }: Props) {
  const navigation = useNavigation()
  const { user: authenticatedUser, logout } = useContext(AuthContext)
  const [user, setUser] = useState<User | null>()
  const [recipes, setRecipes] = useState<Recipe[] | null>()

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const user = await User.findById(route.params.id)

      if (!user) {
        navigation.setOptions({
          title: 'Page non trouvée',
        })

        setUser(null)
        setRecipes(null)
        return
      }

      navigation.setOptions({
        title: `${user.pseudo}${user.name ? ` (${user.name})` : ''}`,
      })

      const recipes = await Recipe.find({
        author: user.id,
        ...(authenticatedUser?.id !== user.id && { isDraft: false }),
      })
        .sort({ updatedAt: 'descending' })

      setUser(user)
      setRecipes(recipes)
    })

    return unsubscribe
  }, [navigation, route.params.id])

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
        keyExtractor={(item) => item.id.toString()}
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