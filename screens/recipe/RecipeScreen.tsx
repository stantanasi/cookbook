import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { recipes } from '../../data/recipes';
import { RootStackParamList } from '../../navigation/types';
import images from '../../constants/images';

type Props = NativeStackScreenProps<RootStackParamList, 'Recipe'>;

export default function RecipeScreen({ navigation, route }: Props) {
  const recipe = recipes.find((recipe) => recipe.id === route.params.id)

  if (!recipe) {
    navigation.goBack()
    return null
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        style={styles.image}
        source={images[recipe.image]}
      />
      <Text style={styles.title}>
        {recipe.title}
      </Text>
      <Text>
        {new Date(recipe.updatedAt).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </Text>

      <View>
        <Text>{recipe.preparationTime} min</Text>
        <Text>{recipe.cookingTime} min</Text>
      </View>

      <Pressable onPress={() => navigation.navigate('RecipeSave', { id: route.params.id })}>
        <Text>Editer</Text>
      </Pressable>

      <View style={styles.section}>
        <Text style={styles.h1}>Ingrédients</Text>
        {recipe.ingredients
          .map((ingredient, index) => (
            <View key={index}>
              <Text style={styles.stepTitle}>{ingredient.title}</Text>
              {ingredient.items
                .map((item, index) => (
                  <View key={index}>
                    <Text>{item.quantity} {item.unit} {item.name}</Text>
                  </View>
                ))}
            </View>
          ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.h1}>Étapes</Text>
        {recipe.steps
          .map((step, index) => (
            <View key={index}>
              {step.title &&
                <Text style={styles.stepTitle}>{step.title}</Text>}
              <View style={{ gap: 5 }}>
                {step.actions.map((action, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Text>• </Text>
                    <Text>{action}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  title: {
    color: '#000000',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 40,
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
  },
  h1: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  stepTitle: {
    fontSize: 20,
  },
});
