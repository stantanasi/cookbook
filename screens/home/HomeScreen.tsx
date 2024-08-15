import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import Recipe from './components/Recipe';
import RecipeModel from '../../models/recipe.model';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [recipes, setRecipes] = useState<RecipeModel[]>([])

  useEffect(() => {
    RecipeModel.find()
      .then((data) => setRecipes(data))
  }, [])

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
          <Pressable onPress={() => navigation.navigate('RecipeSave', {})}>
            <Text>Ajouter une recette</Text>
          </Pressable>
        )}
      />
    </View>
  );
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
});
