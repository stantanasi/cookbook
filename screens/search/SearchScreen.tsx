import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import slugify from 'slugify';
import RecipeCard from '../../components/molecules/RecipeCard';
import { useHeader } from '../../contexts/HeaderContext';
import { useSearch } from './hooks/useSearch';

type Props = StaticScreenProps<{
  query: string;
  includeIngredients?: string;
  excludeIngredients?: string;
  category?: string;
  cuisine?: string;
  totalTime?: string;
}>;

export default function SearchScreen({ route }: Props) {
  const navigation = useNavigation();
  const isInitialMount = useRef(true);
  const { setIsSearchVisible, query, setQuery, filter, setFilter } = useHeader();
  const { recipes } = useSearch(route.params);

  useEffect(() => {
    setIsSearchVisible(true);
    setQuery(route.params.query);
    setFilter(Object.fromEntries(
      Object.entries(route.params)
        .filter(([path, values]) => path !== 'query' && values && values.length > 0)
        .map(([path, values]) => [path, values.split(',')])
    ));

    isInitialMount.current = false;
  }, []);

  useLayoutEffect(() => {
    if (isInitialMount.current) return;

    navigation.setOptions({
      title: `Recettes ${query}`.trim(),
    });

    navigation.setParams({
      query: query,
      includeIngredients: filter.includeIngredients?.join(','),
      excludeIngredients: filter.excludeIngredients?.join(','),
      category: filter.category?.join(','),
      cuisine: filter.cuisine?.join(','),
      totalTime: filter.totalTime?.join(','),
    });
  }, [navigation, query, filter]);

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
        ListHeaderComponent={() => (<>
          <Text style={styles.title}>
            {`Recettes ${route.params.query}`.trim()}
          </Text>
        </>)}
        ListEmptyComponent={() => (
          <Text style={styles.emptyListText}>
            {`Pas de résultats ${route.params.query ? `pour ${route.params.query}` : ''}`.trim()}
          </Text>
        )}
        ListFooterComponent={() => <View style={{ height: 20 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    marginHorizontal: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  recipe: {
    marginHorizontal: 16,
  },
  emptyListText: {
    marginHorizontal: 16,
  },
});