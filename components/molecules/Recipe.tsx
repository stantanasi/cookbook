import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { Image, Pressable, PressableProps, StyleSheet, Text, View, ViewStyle } from 'react-native'
import { IRecipe } from '../../models/recipe.model'
import { Model } from '../../utils/mongoose/model'
import { toTimeString } from '../../utils/utils'


type Props = PressableProps & {
  recipe: Model<IRecipe>
  style?: ViewStyle
}

export default function Recipe({ recipe, style, ...props }: Props) {
  return (
    <Pressable
      {...props}
      style={[styles.container, style]}
    >
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
          alignItems: 'flex-end',
          flexDirection: 'row',
          margin: 16,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {recipe.title}
          </Text>
          <View style={styles.infos}>
            <Text style={styles.info}>
              {toTimeString(recipe.preparationTime + recipe.cookingTime + recipe.restTime)}
            </Text>
          </View>
        </View>

        {recipe.isDraft && (
          <MaterialIcons
            name="edit-document"
            size={24}
            color="#fff"
          />
        )}
      </View>
    </Pressable>
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
  },
  infos: {
    flexDirection: 'row',
    marginTop: 6,
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