import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Fragment, useContext, useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Recipe from '../../components/Recipe';
import { AuthContext } from '../../contexts/AuthContext';
import CategoryModel, { CATEGORY_ALL, ICategory } from '../../models/category.model';
import RecipeModel, { IRecipe } from '../../models/recipe.model';
import { RootStackParamList } from '../../navigation/types';
import { Model } from '../../utils/database/model';

const Header = ({ recipes, categories, selectedCategory, onSelectCategory }: {
  recipes: Model<IRecipe>[]
  categories: Model<ICategory>[]
  selectedCategory: Model<ICategory>
  onSelectCategory: (category: Model<ICategory>) => Promise<void>
}) => {
  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 10,
          paddingHorizontal: 16,
        }}
        style={{
          marginTop: 16,
        }}
      >
        {categories.map((category, index) => {
          const isSelected = category.id === selectedCategory.id
          return (
            <Fragment key={`category-${category.id}`}>
              <Text
                onPress={() => onSelectCategory(category)}
                style={{
                  backgroundColor: isSelected ? '#000' : '#fff',
                  borderColor: '#000',
                  borderRadius: 360,
                  borderWidth: 1,
                  color: isSelected ? '#fff' : '#000',
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                }}
              >
                {category.name}
              </Text>

              {index === 0 && (
                <View
                  style={{
                    borderRightColor: '#000',
                    borderRightWidth: StyleSheet.hairlineWidth,
                  }}
                />
              )}
            </Fragment>
          )
        })}
      </ScrollView>
      <Text
        style={{
          marginBottom: 12,
          marginHorizontal: 16,
          marginTop: 20,
        }}
      >
        {recipes.length} recettes
      </Text>
    </>
  )
}

const Footer = () => {
  return (
    <View style={{ height: 20 }} />
  )
}


type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { isAuthenticated } = useContext(AuthContext)
  const [recipes, setRecipes] = useState<Model<IRecipe>[]>([])
  const [categories, setCategories] = useState<Model<ICategory>[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Model<ICategory>>(CATEGORY_ALL)

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const categories = await CategoryModel.find()
      const recipes = await RecipeModel.find({
        filter: {
          ...(!!selectedCategory.id && { category: selectedCategory.id }),
        },
        sort: {
          updatedAt: 'descending',
        },
      })

      setRecipes(recipes)
      setCategories([
        CATEGORY_ALL,
        ...categories,
      ])
    });

    return unsubscribe;
  }, [navigation, selectedCategory])

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
        ListHeaderComponent={Header({
          recipes: recipes,
          categories: categories,
          selectedCategory: selectedCategory,
          onSelectCategory: async (category) => {
            const recipes = await RecipeModel.find({
              filter: {
                ...(!!category.id && { category: category.id }),
              },
              sort: {
                updatedAt: 'descending',
              },
            })

            setRecipes(recipes)
            setSelectedCategory(category)
          }
        })}
        ListFooterComponent={Footer()}
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
