import { MaterialIcons } from '@expo/vector-icons';
import { StackActions, StaticScreenProps, useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import slugify from 'slugify';
import RecipeCard from '../../components/molecules/RecipeCard';
import { AuthContext } from '../../contexts/AuthContext';
import Recipe from '../../models/recipe.model';
import User from '../../models/user.model';
import Footer from './components/Footer';
import Header from './components/Header';

type Props = StaticScreenProps<{
  id: number
}>

export default function ProfileScreen({ route }: Props) {
  const navigation = useNavigation()
  const { user: authenticatedUser, logout } = useContext(AuthContext)
  const [user, setUser] = useState<User>()
  const [recipes, setRecipes] = useState<Recipe[]>()

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const user = await User.findById(route.params.id)

      if (!user) {
        navigation.navigate('NotFound')
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

  if (!user || !recipes) {
    return (
      <View
        style={{
          alignItems: 'center',
          flex: 1,
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator
          animating
          color="#000"
          size="large"
        />
      </View>
    )
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
        <MaterialIcons
          name="add"
          size={32}
          color="#000"
          onPress={() => navigation.navigate('RecipeCreate')}
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            backgroundColor: '#EAEDE8',
            borderRadius: 360,
            elevation: 5,
            padding: 10,
            shadowColor: '#000',
            shadowOffset: { width: 1, height: 1 },
            shadowOpacity: 0.4,
            shadowRadius: 3,
          }}
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