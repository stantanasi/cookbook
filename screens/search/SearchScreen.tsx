import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import Recipe from '../../components/molecules/Recipe';
import RecipeModel, { IRecipe } from '../../models/recipe.model';
import { RootStackParamList } from '../../navigation/types';
import { FilterQuery, Model } from '../../utils/mongoose';

export type SearchFilterQuery = {
  includeIngredients?: string
  excludeIngredients?: string
  category?: string
  cuisine?: string
  totalTime?: string
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
      $and: ([] as FilterQuery<IRecipe>[])
        .concat({
          $or: filter.category?.split(',')
            .filter((value) => value)
            .map((value: any) => {
              return { category: value }
            })
            ?? []
        })
        .concat({
          $or: filter.cuisine?.split(',')
            .filter((value) => value)
            .map((value: any) => {
              return { cuisine: value }
            })
            ?? []
        }),
    })
      .then((recipes) => {
        if (!filter.includeIngredients) return recipes

        const includedIngredients = new Set(filter.includeIngredients.split(','));
        return recipes.filter((recipe) =>
          recipe.steps.some((step) =>
            step.ingredients.some((ingredient) =>
              includedIngredients.has(ingredient.name)
            )
          )
        )
      })
      .then((recipes) => {
        if (!filter.excludeIngredients) return recipes

        const excludeIngredients = new Set(filter.excludeIngredients.split(','));
        return recipes.filter((recipe) =>
          !recipe.steps.some((step) =>
            step.ingredients.some((ingredient) =>
              excludeIngredients.has(ingredient.name)
            )
          )
        )
      })
      .then((recipes) => {
        if (!filter.totalTime) return recipes

        return recipes.filter((recipe) => {
          const recipeTotalTime = recipe.preparationTime + recipe.cookingTime + recipe.restTime

          return filter.totalTime?.split(',')
            .some((filterTotalTime) => {
              if (filterTotalTime === '30') {
                return recipeTotalTime <= 30
              } else if (filterTotalTime === '30-60') {
                return recipeTotalTime >= 30 && recipeTotalTime <= 60
              } else if (filterTotalTime === '60') {
                return recipeTotalTime >= 60
              } else {
                return false
              }
            })
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