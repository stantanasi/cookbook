import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { RootStackParamList } from '../../navigation/types';
import RecipeApi from '../../utils/recipe-api';
import Recipe from './components/Recipe';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export default function SearchScreen({ navigation, route }: Props) {
  const query = route.params.query
  const recipes = RecipeApi.search(query)

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        keyExtractor={(_, index) => index.toString()}
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