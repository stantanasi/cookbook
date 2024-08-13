import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { IRecipe } from '../../../types/recipe.type'

type Props = {
  recipe: IRecipe
}

export default function Recipe({ recipe }: Props) {
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={{ uri: recipe.image ?? undefined }}
      />
      <Text style={styles.title}>
        {recipe.title}
      </Text>
      <Text style={styles.description}>
        {recipe.description}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#c6bdb466',
    borderRadius: 12,
    flex: 1,
    padding: 16,
  },
  image: {
    width: '100%',
    height: 230,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  title: {
    color: '#000000',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  description: {
    color: '#808080',
    marginTop: 16,
  },
});