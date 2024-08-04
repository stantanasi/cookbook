import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { IIngredientItem } from '../../../types/recipe.type'

type Props = {
  item: IIngredientItem
  portionSize: number
  servings: number
}

export default function IngredientItem({ item, portionSize, servings }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {item.name}
      </Text>
      <Text style={styles.value}>
        {Math.round(item.quantity * (portionSize / servings))}{item.unit && ` ${item.unit}`}
      </Text>
    </View>
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