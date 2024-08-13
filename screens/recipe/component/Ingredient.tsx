import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import IngredientItem from './IngredientItem'
import { IIngredient } from '../../../models/recipe.model'

type Props = {
  ingredient: IIngredient
  portionFactor: number
}

export default function Ingredient({ ingredient, portionFactor }: Props) {
  return (
    <View style={styles.container}>
      {ingredient.title &&
        <Text style={styles.title}>{ingredient.title}</Text>}

      <View style={styles.items}>
        {ingredient.items.map((item, index) => (
          <IngredientItem
            key={index}
            item={item}
            portionFactor={portionFactor}
          />
        ))}
      </View>
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
  items: {
    marginTop: 10,
  },
})