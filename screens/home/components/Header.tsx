import React, { Fragment } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Category from '../../../models/category.model';
import Recipe from '../../../models/recipe.model';

type Props = {
  recipes: Recipe[];
  categories: Category[];
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
};

export default function Header({
  recipes,
  categories,
  selectedCategory,
  onSelectCategory,
}: Props) {
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
          const isSelected = category.id?.toString() == selectedCategory.id?.toString();
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
          );
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
  );
}