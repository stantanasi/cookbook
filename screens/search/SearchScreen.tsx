import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import React, { useLayoutEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import slugify from 'slugify';
import RecipeCard from '../../components/molecules/RecipeCard';
import { useSearch } from './hooks/useSearch';

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
  const { recipes } = useSearch(route.params)

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `Recettes ${route.params.query}`,
    })
  }, [navigation, route.params])

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
        ListHeaderComponent={() => (<>
          <Text style={styles.title}>
            Recette {route.params.query}
          </Text>
        </>)}
        ListEmptyComponent={() => (
          <Text style={styles.emptyListText}>
            Pas de résultats pour {route.params.query}
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