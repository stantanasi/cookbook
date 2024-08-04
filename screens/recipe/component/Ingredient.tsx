import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { IIngredient } from '../../../types/recipe.type'
import IngredientItem from './IngredientItem'

type Props = {
  ingredient: IIngredient
  portionSize: number
  servings: number
}

export default function Ingredient({ ingredient, portionSize, servings }: Props) {
  return (
    <View style={styles.container}>
      {ingredient.title &&
        <Text style={styles.title}>{ingredient.title}</Text>}

      <View style={styles.items}>
        {ingredient.items.map((item, index) => (
          <IngredientItem
            key={index}
            item={item}
            portionSize={portionSize}
            servings={servings}
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