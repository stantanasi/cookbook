import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import Recipe from '../../models/recipe.model';
import Section from './components/Section';
import { useHome } from './hooks/useHome';

type Props = StaticScreenProps<undefined>;

export default function HomeScreen({ route }: Props) {
  const navigation = useNavigation();
  const { recipes } = useHome(route.params);

  const sections: {
    title: string;
    recipes: Recipe[];
  }[] = useMemo(() => {
    const isLunchTime = new Date().getHours() >= 5 && new Date().getHours() < 16;

    return [
      {
        title: 'Les recettes du jour',
        recipes: recipes.featured,
      },
      {
        title: 'Prêt en moins de 30 min',
        recipes: recipes.quick,
      },
      {
        title: `Pour le ${isLunchTime ? 'déjeuner' : 'dîner'}`,
        recipes: recipes.main,
      },
      {
        title: 'Pause gourmande',
        recipes: recipes.desserts,
      },
      {
        title: 'Cuisine antillaise',
        recipes: recipes.caribbean,
      },
      {
        title: 'Dernières recettes',
        recipes: recipes.latest,
      },
    ].filter((section) => section.recipes.length > 0);
  }, [recipes]);

  return (
    <View style={styles.container}>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <Section
            title={item.title}
            recipes={item.recipes}
          />
        )}
        ListFooterComponent={<View style={{ height: 16 }} />}
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
