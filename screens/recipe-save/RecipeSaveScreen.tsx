import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { RootStackParamList } from '../../navigation/types'
import RecipeApi from '../../utils/recipe-api'

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeSave'>

export default function RecipeSaveScreen({ route }: Props) {
  const recipe = route.params.id
    ? RecipeApi.getRecipeById(route.params.id)
    : null

  const [title, setTitle] = useState(recipe?.title ?? '')
  const [description, setDescription] = useState(recipe?.description ?? '')
  const [preparationTimeHours, setPreparationTimeHours] = useState(Math.floor((recipe?.preparationTime ?? 0) / 60))
  const [preparationTimeMinutes, setPreparationTimeMinutes] = useState((recipe?.preparationTime ?? 0) % 60)
  const [cookingTimeHours, setCookingTimeHours] = useState(Math.floor((recipe?.cookingTime ?? 0) / 60))
  const [cookingTimeMinutes, setCookingTimeMinutes] = useState((recipe?.cookingTime ?? 0) % 60)
  const [restTimeHours, setRestTimeHours] = useState(Math.floor((recipe?.restTime ?? 0) / 60))
  const [restTimeMinutes, setRestTimeMinutes] = useState((recipe?.restTime ?? 0) % 60)
  const [servings, setServings] = useState(recipe?.servings ?? 0)
  const [ingredients, setIngredients] = useState(recipe?.ingredients ?? [])
  const [steps, setSteps] = useState(recipe?.steps ?? [])

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text>Déposer une nouvelle recette</Text>

      <View>
        <Text style={styles.label}>Nom de la recette</Text>
        <TextInput
          value={title}
          onChangeText={(value) => setTitle(value)}
          style={styles.input}
        />
      </View>

      <View>
        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={(value) => setDescription(value)}
          multiline
          numberOfLines={4}
          style={styles.input}
        />
      </View>

      <View style={styles.preparationTime}>
        <Text style={styles.subLabel}>Temps de préparation</Text>
        <View style={styles.preparationTimeInputs}>
          <TextInput
            value={preparationTimeHours.toString()}
            onChangeText={(value) => setPreparationTimeHours(+value.replace(/[^0-9]/g, ''))}
            placeholder='00'
            keyboardType='numeric'
            style={styles.preparationTimeHours}
          />
          <Text style={styles.preparationTimeSeparator}>h</Text>
          <TextInput
            value={preparationTimeMinutes.toString()}
            onChangeText={(value) => setPreparationTimeMinutes(+value.replace(/[^0-9]/g, ''))}
            placeholder='00'
            keyboardType='numeric'
            style={styles.preparationTimeHours}
          />
        </View>
      </View>

      <View style={styles.preparationTime}>
        <Text style={styles.subLabel}>Temps de cuisson</Text>
        <View style={styles.preparationTimeInputs}>
          <TextInput
            value={cookingTimeHours.toString()}
            onChangeText={(value) => setCookingTimeHours(+value.replace(/[^0-9]/g, ''))}
            placeholder='00'
            keyboardType='numeric'
            style={styles.preparationTimeHours}
          />
          <Text style={styles.preparationTimeSeparator}>h</Text>
          <TextInput
            value={cookingTimeMinutes.toString()}
            onChangeText={(value) => setCookingTimeMinutes(+value.replace(/[^0-9]/g, ''))}
            placeholder='00'
            keyboardType='numeric'
            style={styles.preparationTimeHours}
          />
        </View>
      </View>

      <View style={styles.preparationTime}>
        <Text style={styles.subLabel}>Temps de repos</Text>
        <View style={styles.preparationTimeInputs}>
          <TextInput
            value={restTimeHours.toString()}
            onChangeText={(value) => setRestTimeHours(+value.replace(/[^0-9]/g, ''))}
            placeholder='00'
            keyboardType='numeric'
            style={styles.preparationTimeHours}
          />
          <Text style={styles.preparationTimeSeparator}>h</Text>
          <TextInput
            value={restTimeMinutes.toString()}
            onChangeText={(value) => setRestTimeMinutes(+value.replace(/[^0-9]/g, ''))}
            placeholder='00'
            keyboardType='numeric'
            style={styles.preparationTimeHours}
          />
        </View>
      </View>

      <View style={styles.preparationTime}>
        <Text style={styles.subLabel}>Nombre de portions</Text>
        <TextInput
          value={servings.toString()}
          onChangeText={(value) => setServings(+value.replace(/[^0-9]/g, ''))}
          placeholder='0'
          keyboardType='numeric'
          style={styles.preparationTimeHours}
        />
      </View>

      <View>
        <Text style={styles.sectionTitle}>Ingrédients</Text>

        {ingredients.map((ingredient, index) => (
          <View key={index} style={{ flex: 1, paddingHorizontal: 13, paddingVertical: 8 }}>
            <View style={styles.removableItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Étape {index + 1}</Text>
                <TextInput
                  value={ingredient.title}
                  onChangeText={(value) => setIngredients((prev) => {
                    const newState = [...prev]
                    newState[index].title = value
                    return newState
                  })}
                  placeholder='Exemple : Pour la préparation'
                  style={styles.input}
                />
              </View>

              <Pressable
                onPress={() => setIngredients((prev) => {
                  const newState = [...prev]
                  newState.splice(index, 1)
                  return newState
                })}
              >
                <Text style={styles.removeButton}>×</Text>
              </Pressable>
            </View>

            {ingredient.items.map((item, i) => (
              <View key={i} style={[styles.removableItem, { paddingHorizontal: 13, paddingVertical: 8 }]}>
                <View style={{ flex: 1 }}>
                  <View style={styles.ingredientItemQuantityUnit}>
                    <View style={{ flex: 0.4 }}>
                      <Text style={styles.subLabel}>Quantité</Text>
                      <TextInput
                        value={item.quantity.toString()}
                        onChangeText={(value) => setIngredients((prev) => {
                          const newState = [...prev]
                          newState[index].items[i].quantity = +value
                          return newState
                        })}
                        keyboardType='numeric'
                        style={styles.input}
                      />
                    </View>
                    <View style={{ flex: 0.6 }}>
                      <Text style={styles.subLabel}>Mesure</Text>
                      <TextInput
                        value={item.unit}
                        onChangeText={(value) => setIngredients((prev) => {
                          const newState = [...prev]
                          newState[index].items[i].unit = value
                          return newState
                        })}
                        style={styles.input}
                      />
                    </View>
                  </View>

                  <View>
                    <Text style={styles.subLabel}>Ingrédient</Text>
                    <TextInput
                      value={item.name}
                      onChangeText={(value) => setIngredients((prev) => {
                        const newState = [...prev]
                        newState[index].items[i].name = value
                        return newState
                      })}
                      style={styles.input}
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
                  <Text style={styles.removeButton}>×</Text>
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
              <Text style={styles.button}>Ajouter un ingrédient</Text>
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
          <Text style={[styles.button, { alignSelf: 'flex-start' }]}>Ajouter une étape</Text>
        </Pressable>
      </View>

      <View>
        <Text style={styles.sectionTitle}>Étapes</Text>

        {steps.map((step, index) => (
          <View key={index} style={{ flex: 1, paddingHorizontal: 13, paddingVertical: 8 }}>
            <View style={styles.removableItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Étape {index + 1}</Text>
                <TextInput
                  value={step.title}
                  onChangeText={(value) => setSteps((prev) => {
                    const newState = [...prev]
                    newState[index].title = value
                    return newState
                  })}
                  style={styles.input}
                />
              </View>

              <Pressable
                onPress={() => setSteps((prev) => {
                  const newState = [...prev]
                  newState.splice(index, 1)
                  return newState
                })}
              >
                <Text style={styles.removeButton}>×</Text>
              </Pressable>
            </View>

            {step.actions.map((action, i) => (
              <View key={i} style={[styles.removableItem, { paddingHorizontal: 13, paddingVertical: 8 }]}>
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
                  style={styles.input}
                />

                <Pressable
                  onPress={() => setSteps((prev) => {
                    const newState = [...prev]
                    newState[index].actions.splice(i, 1)
                    return newState
                  })}
                >
                  <Text style={styles.removeButton}>×</Text>
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
              <Text style={styles.button}>Ajouter une action</Text>
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
          <Text style={[styles.button, { alignSelf: 'flex-start' }]}>Ajouter une étape</Text>
        </Pressable>
      </View>

      <Pressable>
        <Text style={[styles.button, { alignSelf: 'center', marginTop: 24 }]}>Publier ma recette</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 20,
  },
  label: {
    fontSize: 20,
    marginTop: 14,
  },
  subLabel: {
    marginTop: 10,
  },
  input: {
    borderColor: '#ccc',
    borderRadius: 4,
    borderWidth: 1,
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 6,
    paddingVertical: 4,
    textAlignVertical: 'top',
  },
  preparationTime: {
    flex: 1,
  },
  preparationTimeInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  preparationTimeHours: {
    borderColor: '#ccc',
    borderRadius: 4,
    borderWidth: 1,
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 6,
    paddingVertical: 4,
    textAlign: 'center',
  },
  preparationTimeSeparator: {
    color: '#888',
    fontSize: 16,
  },
  preparationTimeMinutes: {
    borderRadius: 4,
    borderWidth: 1,
    flex: 1,
    padding: 0,
    textAlign: 'center',
  },
  sectionTitle: {
    backgroundColor: '#ddd',
    color: '#666',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 32,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 6,
    textTransform: 'uppercase',
  },
  ingredientItemQuantityUnit: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  removableItem: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 16,
  },
  removeButton: {
    width: 32,
    height: 32,
    backgroundColor: '#ddd',
    borderRadius: 100,
    color: '#666',
    fontSize: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#e26a6b',
    borderRadius: 4,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
})