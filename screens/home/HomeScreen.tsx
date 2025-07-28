import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import slugify from 'slugify';
import RecipeCard from '../../components/molecules/RecipeCard';
import Category, { CATEGORY_ALL } from '../../models/category.model';
import Recipe from '../../models/recipe.model';
import LoadingScreen from '../loading/LoadingScreen';
import Footer from './components/Footer';
import Header from './components/Header';

type Props = StaticScreenProps<undefined>

export default function HomeScreen({ }: Props) {
  const navigation = useNavigation()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category>(CATEGORY_ALL)

  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      setIsLoading(true)

      const categories = await Category.find()
      const recipes = await Recipe.find({
        ...{ isNew: false },
        ...(!!selectedCategory.id && { category: selectedCategory.id }),
      })
        .sort({ updatedAt: 'descending' })

      setRecipes(recipes)
      setCategories([
        CATEGORY_ALL,
        ...categories,
      ])
      setIsReady(true)
      setIsLoading(false)
    });

    return unsubscribe;
  }, [navigation, selectedCategory])

  if (!isReady) {
    return <LoadingScreen />
  }

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
          isLoading: isLoading,
          recipes: recipes,
          categories: categories,
          selectedCategory: selectedCategory,
          onSelectCategory: async (category) => {
            setIsLoading(true)

            const recipes = await Recipe.find({
              ...{ isDraft: false },
              ...(!!category.id && { category: category.id }),
            })
              .sort({ updatedAt: 'descending' })

            setRecipes(recipes)
            setSelectedCategory(category)
            setIsLoading(false)
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
