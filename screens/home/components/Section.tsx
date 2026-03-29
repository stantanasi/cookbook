import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import slugify from 'slugify';
import RecipeCard from '../../../components/molecules/RecipeCard';
import Recipe from '../../../models/recipe.model';

type Props = {
  title: string;
  recipes: Recipe[];
};

export default function Section({
  title,
  recipes,
}: Props) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {title}
      </Text>

      <FlatList
        horizontal
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
        ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
        ListHeaderComponent={() => <View style={{ width: 16 }} />}
        ListFooterComponent={() => <View style={{ width: 16 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginHorizontal: 16,
    marginTop: 16,
  },
  recipe: {
    width: 250,
    aspectRatio: 3 / 4,
  },
});
