import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { recipes } from '../../data/recipes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import Recipe from '../../components/Recipe';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
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
