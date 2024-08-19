import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Ingredient from './Ingredient'
import { IRecipe } from '../models/recipe.model'

type Props = {
  recipe: IRecipe
  portionFactor: number
}

export default function Ingredients({ recipe, portionFactor }: Props) {
  return (
    <View style={styles.container}>
      {recipe
        .steps
        .filter((step) => step.ingredients.length)
        .map((step, index) => (
          <View
            key={index}
            style={styles.container}
          >
            {step.title &&
              <Text style={styles.title}>{step.title}</Text>}

            <View style={styles.ingredients}>
              {step.ingredients.map((ingredient, i) => (
                <Ingredient
                  key={i}
                  ingredient={ingredient}
                  portionFactor={portionFactor}
                  checkbox
                />
              ))}
            </View>
          </View>
        ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  ingredients: {
    marginTop: 10,
  },
})