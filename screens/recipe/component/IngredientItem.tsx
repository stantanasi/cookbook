import Checkbox from 'expo-checkbox'
import React, { useState } from 'react'
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, View } from 'react-native'
import { IIngredientItem } from '../../../types/recipe.type'

type Props = {
  item: IIngredientItem
  portionFactor: number
}

export default function IngredientItem({ item, portionFactor }: Props) {
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
          {item.name}
        </Text>
        <Text style={[styles.value, strikeTrough]}>
          {Math.round(item.quantity * portionFactor)}{item.unit && ` ${item.unit}`}
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