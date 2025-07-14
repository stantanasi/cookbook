import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import slugify from 'slugify';
import RecipeCard from '../../components/molecules/RecipeCard';
import Recipe, { IRecipe } from '../../models/recipe.model';
import { FilterQuery } from '../../utils/mongoose';
import LoadingScreen from '../loading/LoadingScreen';

export type SearchFilterQuery = {
  includeIngredients?: string
  excludeIngredients?: string
  category?: string
  cuisine?: string
  totalTime?: string
}

type Props = StaticScreenProps<{
  query: string
} & SearchFilterQuery>

export default function SearchScreen({ route }: Props) {
  const navigation = useNavigation()
  const { query, ...filter } = route.params
  const [recipes, setRecipes] = useState<Recipe[]>([])

  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchRecipes = async () => {
    setIsLoading(true)

    const recipes = await Recipe.search(query, {
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

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `Recettes ${route.params.query}`,
    })
  }, [navigation])

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
    return <LoadingScreen />
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