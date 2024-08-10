import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import Recipe from './components/Recipe';
import RecipeApi from '../../utils/recipe-api';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const recipes = RecipeApi.getRecipes()

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
