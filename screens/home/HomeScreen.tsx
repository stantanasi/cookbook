import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useContext, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import Recipe from '../../components/Recipe';
import { AuthContext } from '../../contexts/AuthContext';
import RecipeModel, { IRecipe } from '../../models/recipe.model';
import { RootStackParamList } from '../../navigation/types';
import { Model } from '../../utils/database/model';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { isAuthenticated } = useContext(AuthContext)
  const [recipes, setRecipes] = useState<Model<IRecipe>[]>([])

  useEffect(() => {
    RecipeModel.find({
      sort: {
        updatedAt: 'descending',
      },
    })
      .then((data) => setRecipes(data))
  }, [])

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('Recipe', { id: item.id })}
            style={styles.recipe}
          >
            <Recipe recipe={item} />
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListHeaderComponent={() => <View style={{ height: 20 }} />}
        ListFooterComponent={() => <View style={{ height: 20 }} />}
      />

      {isAuthenticated && (
        <MaterialIcons
          name="add"
          size={32}
          color="#000"
          onPress={() => navigation.navigate('RecipeSave', {})}
          style={styles.newRecipeButton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  recipe: {
    marginHorizontal: 16,
  },
  newRecipeButton: {
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
  },
});
