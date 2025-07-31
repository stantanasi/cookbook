import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import { FlatList, StyleSheet, View } from 'react-native';
import slugify from 'slugify';
import RecipeCard from '../../components/molecules/RecipeCard';
import Footer from './components/Footer';
import Header from './components/Header';
import { useHome } from './hooks/useHome';

type Props = StaticScreenProps<undefined>

export default function HomeScreen({ route }: Props) {
  const navigation = useNavigation()
  const { categories, recipes, selectedCategory, setSelectedCategory } = useHome(route.params)

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
        ListHeaderComponent={Header({
          recipes: recipes,
          categories: categories,
          selectedCategory: selectedCategory,
          onSelectCategory: (category) => {
            setSelectedCategory(category)
          }
        })}
        ListFooterComponent={Footer()}
      />
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
});
