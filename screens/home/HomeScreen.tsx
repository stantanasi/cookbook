import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Fragment, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Recipe from '../../components/Recipe';
import CategoryModel, { CATEGORY_ALL, ICategory } from '../../models/category.model';
import RecipeModel, { IRecipe } from '../../models/recipe.model';
import { RootStackParamList } from '../../navigation/types';
import { Model } from '../../utils/database/model';

const Header = ({ isLoading, recipes, categories, selectedCategory, onSelectCategory }: {
  isLoading: boolean
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
      {isLoading && (
        <ActivityIndicator
          animating={isLoading}
          color="#000"
          style={{
            alignSelf: 'center',
            marginBottom: 20,
            marginTop: 10,
          }}
        />
      )}
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
  const [recipes, setRecipes] = useState<Model<IRecipe>[]>([])
  const [categories, setCategories] = useState<Model<ICategory>[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Model<ICategory>>(CATEGORY_ALL)

  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      setIsLoading(true)

      const categories = await CategoryModel.find()
      const recipes = await RecipeModel.find({
        ...{ isDraft: false },
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
    return (
      <View
        style={{
          alignItems: 'center',
          flex: 1,
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator
          animating
          color="#000"
          size="large"
        />
      </View>
    )
  }

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
        ListHeaderComponent={Header({
          isLoading: isLoading,
          recipes: recipes,
          categories: categories,
          selectedCategory: selectedCategory,
          onSelectCategory: async (category) => {
            setIsLoading(true)

            const recipes = await RecipeModel.find({
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
