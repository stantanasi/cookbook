import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { IRecipe } from '../types/recipe.type'

type Props = {
  recipe: IRecipe
}

export default function Recipe({ recipe }: Props) {
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={recipe.image}
      />
      <Text style={styles.title}>{recipe.title}</Text>
      <Text style={styles.description}>{recipe.description}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {},
  title: {},
  description: {},
});