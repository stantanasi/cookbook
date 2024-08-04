import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { RootStackParamList } from '../../navigation/types';
import Ingredient from './component/Ingredient';
import Constants from '../../utils/constants'
import RecipeApi from '../../utils/RecipeApi';

type Props = NativeStackScreenProps<RootStackParamList, 'Recipe'>;

export default function RecipeScreen({ navigation, route }: Props) {
  const recipe = RecipeApi.getRecipeById(route.params.id)
  if (!recipe) {
    navigation.goBack()
    return null
  }

  const [portionSize, setPortionSize] = useState(recipe.servings)

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

      <Image
        style={styles.image}
        source={{
          uri: Constants.IMAGE_BASE_URL + recipe.image
        }}
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
          <Pressable onPress={() => setPortionSize((prev) => prev - 1)}>
            <Text style={[styles.servingsButton, { borderRightColor: '#333', borderRightWidth: 2 }]}>
              -
            </Text>
          </Pressable>
          <TextInput
            value={portionSize.toString()}
            onChangeText={(value) => setPortionSize(+value.replace(/[^0-9]/g, ''))}
            keyboardType='numeric'
            style={styles.servingsButton}
          />
          <Pressable onPress={() => setPortionSize((prev) => prev + 1)}>
            <Text style={[styles.servingsButton, { borderLeftColor: '#333', borderLeftWidth: 2 }]}>
              +
            </Text>
          </Pressable>
        </View>

        {recipe.ingredients.map((ingredient, index) => (
          <Ingredient
            key={index}
            ingredient={ingredient}
            portionSize={portionSize}
            servings={recipe.servings}
          />
        ))}
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
          <View
            key={index}
            style={styles.step}
          >
            {step.title &&
              <Text style={styles.stepTitle}>{step.title}</Text>}

            <View style={styles.stepActions}>
              {step.actions.map((action, index) => (
                <View
                  key={index}
                  style={styles.stepAction}
                >
                  <Text style={styles.stepActionDot}>• </Text>
                  <Text style={styles.stepActionValue}>{action}</Text>
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
    height: 300,
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
  step: {
    marginTop: 20,
  },
  stepTitle: {
    fontSize: 20,
    textTransform: 'uppercase',
  },
  stepActions: {
    marginTop: 10,
  },
  stepAction: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stepActionDot: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  stepActionValue: {
    fontSize: 15,
  },
});
