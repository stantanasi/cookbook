import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useState } from 'react'
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { RootStackParamList } from '../../navigation/types'
import { recipes } from '../../data/recipes'

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeSave'>

export default function RecipeSaveScreen({ route }: Props) {
  const recipe = recipes.find((recipe) => recipe.id === route.params.id)

  const [title, setTitle] = useState(recipe?.title ?? '')
  const [description, setDescription] = useState(recipe?.description ?? '')
  const [preparationTimeHours, setPreparationTimeHours] = useState(Math.floor((recipe?.preparationTime ?? 0) / 60))
  const [preparationTimeMinutes, setPreparationTimeMinutes] = useState((recipe?.preparationTime ?? 0) % 60)
  const [cookingTimeHours, setCookingTimeHours] = useState(Math.floor((recipe?.cookingTime ?? 0) / 60))
  const [cookingTimeMinutes, setCookingTimeMinutes] = useState((recipe?.cookingTime ?? 0) % 60)
  const [servings, setServings] = useState(recipe?.servings ?? 0)
  const [ingredients, setIngredients] = useState(recipe?.ingredients ?? [])
  const [steps, setSteps] = useState(recipe?.steps ?? [])

  return (
    <ScrollView>
      <Text>Déposer une nouvelle recette</Text>

      <View>
        <Text>Nom de la recette</Text>
        <TextInput
          value={title}
          onChangeText={(value) => setTitle(value)}
        />
      </View>

      <View>
        <Text>Description</Text>
        <TextInput
          value={description}
          onChangeText={(value) => setDescription(value)}
          multiline
          numberOfLines={4}
        />
      </View>

      <View>
        <Text>Temps de préparation</Text>
        <View>
          <TextInput
            value={preparationTimeHours.toString()}
            onChangeText={(value) => setPreparationTimeHours(+value.replace(/[^0-9]/g, ''))}
            placeholder='00'
            keyboardType='numeric'
          />
          <Text>h</Text>
          <TextInput
            value={preparationTimeMinutes.toString()}
            onChangeText={(value) => setPreparationTimeMinutes(+value.replace(/[^0-9]/g, ''))}
            placeholder='00'
            keyboardType='numeric'
          />
        </View>
      </View>

      <View>
        <Text>Temps de cuisson</Text>
        <View>
          <TextInput
            value={cookingTimeHours.toString()}
            onChangeText={(value) => setCookingTimeHours(+value.replace(/[^0-9]/g, ''))}
            placeholder='00'
            keyboardType='numeric'
          />
          <Text>h</Text>
          <TextInput
            value={cookingTimeMinutes.toString()}
            onChangeText={(value) => setCookingTimeMinutes(+value.replace(/[^0-9]/g, ''))}
            placeholder='00'
            keyboardType='numeric'
          />
        </View>
      </View>

      <View>
        <Text>Nombre de portions</Text>
        <TextInput
          value={servings.toString()}
          onChangeText={(value) => setServings(+value.replace(/[^0-9]/g, ''))}
          placeholder='0'
          keyboardType='numeric'
        />
      </View>

      <View>
        <Text>Ingrédients</Text>

        {ingredients.map((ingredient, index) => (
          <View key={index}>
            <View>
              <View>
                <Text>Étape {index + 1}</Text>
                <TextInput
                  value={ingredient.title}
                  onChangeText={(value) => setIngredients((prev) => {
                    const newState = [...prev]
                    newState[index].title = value
                    return newState
                  })}
                />
              </View>

              <Pressable
                onPress={() => setIngredients((prev) => {
                  const newState = [...prev]
                  newState.splice(index, 1)
                  return newState
                })}
              >
                <Text>Supprimer</Text>
              </Pressable>
            </View>

            {ingredient.items.map((item, i) => (
              <View key={i}>
                <View>
                  <View>
                    <View>
                      <Text>Quantité</Text>
                      <TextInput
                        value={item.quantity.toString()}
                        onChangeText={(value) => setIngredients((prev) => {
                          const newState = [...prev]
                          newState[index].items[i].quantity = +value
                          return newState
                        })}
                        keyboardType='numeric'
                      />
                    </View>
                    <View>
                      <Text>Mesure</Text>
                      <TextInput
                        value={item.unit}
                        onChangeText={(value) => setIngredients((prev) => {
                          const newState = [...prev]
                          newState[index].items[i].unit = value
                          return newState
                        })}
                      />
                    </View>
                  </View>

                  <View>
                    <Text>Ingrédient</Text>
                    <TextInput
                      value={item.name}
                      onChangeText={(value) => setIngredients((prev) => {
                        const newState = [...prev]
                        newState[index].items[i].name = value
                        return newState
                      })}
                    />
                  </View>
                </View>

                <Pressable
                  onPress={() => setIngredients((prev) => {
                    const newState = [...prev]
                    newState[index].items.splice(i, 1)
                    return newState
                  })}
                >
                  <Text>Supprimer</Text>
                </Pressable>
              </View>
            ))}

            <Pressable
              onPress={() => setIngredients((prev) => {
                const newState = [...prev]
                newState[index].items.push({
                  quantity: 0,
                  unit: '',
                  name: '',
                })
                return newState
              })}
            >
              <Text>Ajouter un ingrédient</Text>
            </Pressable>
          </View>
        ))}

        <Pressable
          onPress={() => setIngredients((prev) => {
            const newState = [...prev]
            newState.push({
              title: '',
              items: [],
            })
            return newState
          })}
        >
          <Text>Ajouter une étape</Text>
        </Pressable>
      </View>

      <View>
        <Text>Étapes</Text>

        {steps.map((step, index) => (
          <View key={index}>
            <View>
              <View>
                <Text>Étape {index + 1}</Text>
                <TextInput
                  value={step.title}
                  onChangeText={(value) => setSteps((prev) => {
                    const newState = [...prev]
                    newState[index].title = value
                    return newState
                  })}
                />
              </View>

              <Pressable
                onPress={() => setSteps((prev) => {
                  const newState = [...prev]
                  newState.splice(index, 1)
                  return newState
                })}>
                <Text>Supprimer</Text>
              </Pressable>
            </View>

            {step.actions.map((action, i) => (
              <View key={i}>
                <TextInput
                  value={action}
                  onChangeText={(value) => setSteps((prev) => {
                    const newState = [...prev]
                    newState[index].actions[i] = value
                    return newState
                  })}
                  editable
                  multiline
                  numberOfLines={2}
                />

                <Pressable
                  onPress={() => setSteps((prev) => {
                    const newState = [...prev]
                    newState[index].actions.splice(i, 1)
                    return newState
                  })}>
                  <Text>Supprimer</Text>
                </Pressable>
              </View>
            ))}

            <Pressable
              onPress={() => setSteps((prev) => {
                const newState = [...prev]
                newState[index].actions.push('')
                return newState
              })}
            >
              <Text>Ajouter une action</Text>
            </Pressable>
          </View>
        ))}

        <Pressable
          onPress={() => setSteps((prev) => {
            const newState = [...prev]
            newState.push({
              title: '',
              actions: [],
            })
            return newState
          })}
        >
          <Text>Ajouter une étape</Text>
        </Pressable>
      </View>

      <Pressable>
        <Text>Publier ma recette</Text>
      </Pressable>
    </ScrollView>
  )
}