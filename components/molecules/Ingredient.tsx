import Checkbox from 'expo-checkbox'
import React, { useState } from 'react'
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native'
import { IIngredient } from '../../models/recipe.model'
import { round } from '../../utils/utils'


type Props = {
  ingredient: IIngredient
  portionFactor: number
  checkbox?: boolean
  style?: StyleProp<ViewStyle>
}

export default function Ingredient({ ingredient, portionFactor, checkbox, style }: Props) {
  const [isChecked, setIsChecked] = useState(false)
  const strikeTrough: StyleProp<TextStyle> = {
    textDecorationLine: isChecked ? 'line-through' : 'none',
  }

  return (
    <Pressable
      onPress={() => setIsChecked((isChecked) => !!checkbox && !isChecked)}
      style={[styles.container, style]}
    >
      {checkbox && (
        <Checkbox
          value={isChecked}
          onValueChange={(value) => setIsChecked(value)}
          color="#000"
          style={styles.checkbox}
        />
      )}
      <Text style={[styles.name, strikeTrough]}>
        {ingredient.name}
      </Text>
      <Text style={[styles.value, strikeTrough]}>
        {round(ingredient.quantity * portionFactor, 1)}{!!ingredient.unit && ` ${ingredient.unit}`}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#F5F7FD',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  checkbox: {
  },
  name: {
    flex: 1,
  },
  value: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
})