import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { RootStackParamList } from '../../navigation/types';
import Recipe from './components/Recipe';
import RecipeModel from '../../models/recipe.model';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export default function SearchScreen({ navigation, route }: Props) {
  const query = route.params.query
  const [recipes, setRecipes] = useState<RecipeModel[]>([])

  useEffect(() => {
    RecipeModel.search(query)
      .then((data) => setRecipes(data))
  }, [query])

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('Recipe', { id: item.id })}>
            <Recipe recipe={item} />
          </Pressable>
        )}
        contentContainerStyle={styles.recipes}
        ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
        ListHeaderComponent={() => (
          <Text>Recette {query}</Text>
        )}
        ListEmptyComponent={() => (
          <Text>Pas de résultats pour {query}</Text>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  recipes: {
    paddingStart: 12,
    paddingTop: 20,
    paddingEnd: 12,
    paddingBottom: 20,
  },
})