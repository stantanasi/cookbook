import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { RootStackParamList } from '../../navigation/types';
import Step from '../../components/Step';
import AutoHeightImage from '../../components/AutoHeightImage';
import RecipeModel from '../../models/recipe.model';
import Ingredients from '../../components/Ingredients';

type Props = NativeStackScreenProps<RootStackParamList, 'Recipe'>;

export default function RecipeScreen({ navigation, route }: Props) {
  const [recipe, setRecipe] = useState<RecipeModel | null>()
  const [servings, setServings] = useState(recipe?.servings ?? 0)

  if (recipe === null) {
    navigation.replace('NotFound')
    return null
  }

  useEffect(() => {
    RecipeModel.findById(route.params.id)
      .then((data) => {
        setRecipe(data)
        setServings(data?.servings ?? 0)
      })
  }, [route.params.id])

  if (!recipe) {
    return (
      <View></View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {recipe.title}
      </Text>
      <Text style={styles.date}>
        {new Date(recipe.updatedAt).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </Text>

      <AutoHeightImage
        style={styles.image}
        source={{ uri: recipe.image ?? undefined }}
      />

      <View style={styles.infos}>
        <View style={styles.timeInfos}>
          <Text>
            {(() => {
              const totalTime = recipe.preparationTime + recipe.cookingTime
              return `${Math.floor(totalTime / 60)} h ${totalTime % 60} min`
            })()}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>
        {recipe.description}
      </Text>

      <Pressable onPress={() => navigation.navigate('RecipeSave', { id: route.params.id })}>
        <Text>Editer</Text>
      </Pressable>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ingrédients</Text>

        <View style={styles.servings}>
          <Pressable onPress={() => setServings((prev) => prev - 1)}>
            <Text style={[styles.servingsButton, { borderRightColor: '#333', borderRightWidth: 2 }]}>
              -
            </Text>
          </Pressable>
          <TextInput
            value={servings.toString()}
            onChangeText={(value) => setServings(+value.replace(/[^0-9]/g, ''))}
            keyboardType='numeric'
            style={styles.servingsButton}
          />
          <Pressable onPress={() => setServings((prev) => prev + 1)}>
            <Text style={[styles.servingsButton, { borderLeftColor: '#333', borderLeftWidth: 2 }]}>
              +
            </Text>
          </Pressable>
        </View>

        <Ingredients
          recipe={recipe}
          portionFactor={servings / recipe.servings}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Étapes</Text>

        <View style={styles.times}>
          <View style={styles.time}>
            <Text style={styles.timeLabel}>Préparation</Text>
            <Text style={styles.timeValue}>{(() => {
              const hours = Math.floor(recipe.preparationTime / 60)
              const minutes = recipe.preparationTime % 60
              return `${hours} h ${minutes} min`
            })()}</Text>
          </View>

          <View style={styles.time}>
            <Text style={styles.timeLabel}>Cuisson</Text>
            <Text style={styles.timeValue}>{(() => {
              const hours = Math.floor(recipe.cookingTime / 60)
              const minutes = recipe.cookingTime % 60
              return `${hours} h ${minutes} min`
            })()}</Text>
          </View>

          <View style={styles.time}>
            <Text style={styles.timeLabel}>Repos</Text>
            <Text style={styles.timeValue}>{(() => {
              const hours = Math.floor(recipe.restTime / 60)
              const minutes = recipe.restTime % 60
              return `${hours} h ${minutes} min`
            })()}</Text>
          </View>
        </View>

        {recipe.steps.map((step, index) => (
          <Step
            key={index}
            step={step}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  title: {
    color: '#000000',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  date: {
    color: '#a1a1a1',
    fontSize: 10,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    borderRadius: 12,
    marginTop: 16,
  },
  infos: {
    flex: 1,
    marginTop: 18,
  },
  timeInfos: {
    flex: 1,
  },
  description: {
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  section: {
    borderTopColor: '#000',
    borderTopWidth: 2,
    marginTop: 24,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  servings: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderColor: '#000',
    borderRadius: 10,
    borderWidth: 2,
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  servingsButton: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  times: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 12,
  },
  time: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
  },
  timeValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
