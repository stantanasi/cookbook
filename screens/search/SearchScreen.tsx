import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import Recipe from '../../components/molecules/Recipe';
import RecipeModel, { IRecipe } from '../../models/recipe.model';
import { RootStackParamList } from '../../navigation/types';
import { Model } from '../../utils/mongoose';

export type SearchFilterQuery = {
  [P in keyof IRecipe]?: string
}

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export default function SearchScreen({ navigation, route }: Props) {
  const { query, ...filter } = route.params
  const [recipes, setRecipes] = useState<Model<IRecipe>[]>([])

  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchRecipes = async () => {
    setIsLoading(true)

    const recipes = await RecipeModel.search(query, {
      $and: Object.entries(filter)
        .map(([path, values]) => {
          return {
            $or: values.split(",")
              .filter((value) => value)
              .map((value) => {
                return { [path]: value }
              })
          }
        })
    })

    setRecipes(recipes)
    setIsReady(true)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchRecipes()
  }, [route.params])

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchRecipes()
    })

    return unsubscribe
  }, [navigation, route.params])

  if (!isReady) {
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
          <Recipe
            recipe={item}
            onPress={() => navigation.navigate('Recipe', { id: item.id.toString() })}
            style={styles.recipe}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListHeaderComponent={() => (<>
          <Text style={styles.title}>
            Recette {query}
          </Text>
          {isLoading && (
            <ActivityIndicator
              animating={isLoading}
              color="#000"
              style={{
                alignSelf: 'center',
                marginBottom: 20,
                marginTop: 10,
              }}
            />
          )}
        </>)}
        ListEmptyComponent={() => (
          <Text style={styles.emptyListText}>
            Pas de résultats pour {query}
          </Text>
        )}
        ListFooterComponent={() => <View style={{ height: 20 }} />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    marginHorizontal: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  recipe: {
    marginHorizontal: 16,
  },
  emptyListText: {
    marginHorizontal: 16,
  },
})