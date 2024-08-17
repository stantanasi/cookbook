import Checkbox from 'expo-checkbox'
import React, { useState } from 'react'
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, View } from 'react-native'
import { IIngredient } from '../../../models/recipe.model'

type Props = {
  ingredient: IIngredient
  portionFactor: number
}

export default function Ingredient({ ingredient, portionFactor }: Props) {
  const [isChecked, setIsChecked] = useState(false)
  const strikeTrough: StyleProp<TextStyle> = { textDecorationLine: isChecked ? 'line-through' : 'none' }

  return (
    <Pressable
      onPress={() => setIsChecked((isChecked) => !isChecked)}
    >
      <View style={styles.container}>
        <Checkbox
          value={isChecked}
          onValueChange={(value) => setIsChecked(value)}
        />
        <Text style={[styles.label, strikeTrough]}>
          {ingredient.name}
        </Text>
        <Text style={[styles.value, strikeTrough]}>
          {Math.round(ingredient.quantity * portionFactor)}{ingredient.unit && ` ${ingredient.unit}`}
        </Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 10,
  },
  label: {
    color: '#707070',
    flex: 1,
  },
  value: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
})