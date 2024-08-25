import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { IRecipe } from '../models/recipe.model'
import { Model } from '../utils/database/model'

type Props = {
  recipe: Model<IRecipe>
}

export default function Recipe({ recipe }: Props) {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: recipe.image ?? undefined }}
        resizeMode="cover"
        style={styles.image}
      />

      <LinearGradient
        colors={['#00000000', '#000000']}
        style={[{
          position: 'absolute',
          bottom: 0,
          left: 0,
          top: 0,
          right: 0,
          borderRadius: styles.container.borderRadius,
        }]}
      />

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <Text style={styles.title}>
          {recipe.title}
        </Text>
        <View style={styles.infos}>
          <Text style={styles.info}>
            {(() => {
              const duration = recipe.preparationTime + recipe.cookingTime
              const hours = Math.floor(duration / 60)
              const minutes = duration % 60
              return `${hours ? `${hours} h ` : ''}${minutes ? `${minutes} min` : ''}`
            })()}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
  },
  image: {
    width: '100%',
    height: 230,
    borderRadius: 12,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginHorizontal: 16,
  },
  infos: {
    flexDirection: 'row',
    marginBottom: 16,
    marginTop: 6,
    marginHorizontal: 16,
  },
  info: {
    backgroundColor: '#808080AA',
    borderRadius: 360,
    color: '#FFFFFF',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
});