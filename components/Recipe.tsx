import React from 'react'
import { Image, Text, View } from 'react-native'
import { IRecipe } from '../types/recipe.type'

type Props = {
  recipe: IRecipe
}

export default function Recipe({ recipe }: Props) {
  return (
    <View>
      <Image source={recipe.image} />
      <Text>{recipe.title}</Text>
    </View>
  )
}