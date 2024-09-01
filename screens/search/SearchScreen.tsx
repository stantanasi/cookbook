import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Recipe from '../../components/Recipe';
import RecipeModel, { IRecipe } from '../../models/recipe.model';
import { RootStackParamList } from '../../navigation/types';
import { Model } from '../../utils/database/model';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export default function SearchScreen({ navigation, route }: Props) {
  const query = route.params.query
  const [recipes, setRecipes] = useState<Model<IRecipe>[]>([])

  const searchRecipes = async (query: string) => {
    const recipes = await RecipeModel.search(query)

    setRecipes(recipes)
  }

  useEffect(() => {
    searchRecipes(query)
  }, [query])

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      searchRecipes(query)
    })

    return unsubscribe
  }, [navigation, query])

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('Recipe', { id: item.id.toString() })}
            style={styles.recipe}
          >
            <Recipe recipe={item} />
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListHeaderComponent={() => (
          <Text style={styles.title}>
            Recette {query}
          </Text>
        )}
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