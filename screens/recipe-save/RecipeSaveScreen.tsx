import { MaterialIcons } from '@expo/vector-icons'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker'
import React, { useContext, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import AutoHeightImage from '../../components/AutoHeightImage'
import TextInput from '../../components/TextInput'
import TextInputLabel from '../../components/TextInputLabel'
import { AuthContext } from '../../contexts/AuthContext'
import RecipeModel from '../../models/recipe.model'
import { RootStackParamList } from '../../navigation/types'

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeSave'>

export default function RecipeSaveScreen({ navigation, route }: Props) {
  const { user } = useContext(AuthContext)
  const [recipe, setRecipe] = useState<RecipeModel | null>(null)

  const [title, setTitle] = useState(recipe?.title ?? '')
  const [description, setDescription] = useState(recipe?.description ?? '')
  const [image, setImage] = useState(recipe?.image ?? null)
  const [preparationTimeHours, setPreparationTimeHours] = useState(Math.floor((recipe?.preparationTime ?? 0) / 60))
  const [preparationTimeMinutes, setPreparationTimeMinutes] = useState((recipe?.preparationTime ?? 0) % 60)
  const [cookingTimeHours, setCookingTimeHours] = useState(Math.floor((recipe?.cookingTime ?? 0) / 60))
  const [cookingTimeMinutes, setCookingTimeMinutes] = useState((recipe?.cookingTime ?? 0) % 60)
  const [restTimeHours, setRestTimeHours] = useState(Math.floor((recipe?.restTime ?? 0) / 60))
  const [restTimeMinutes, setRestTimeMinutes] = useState((recipe?.restTime ?? 0) % 60)
  const [servings, setServings] = useState(recipe?.servings ?? 1)
  const [steps, setSteps] = useState(recipe?.steps ?? [])

  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!route.params.id) {
      setRecipe(null)
      navigation.setOptions({
        title: 'Publier une nouvelle recette',
      })
      return
    }

    RecipeModel.findById(route.params.id)
      .then((data) => {
        setRecipe(data)

        navigation.setOptions({
          title: data
            ? `${data.title} - Éditer`
            : 'Publier une nouvelle recette',
        })
      })
  }, [route.params.id])

  useEffect(() => {
    setTitle(recipe?.title ?? '')
    setDescription(recipe?.description ?? '')
    setImage(recipe?.image ?? null)
    setPreparationTimeHours(Math.floor((recipe?.preparationTime ?? 0) / 60))
    setPreparationTimeMinutes((recipe?.preparationTime ?? 0) % 60)
    setCookingTimeHours(Math.floor((recipe?.cookingTime ?? 0) / 60))
    setCookingTimeMinutes((recipe?.cookingTime ?? 0) % 60)
    setRestTimeHours(Math.floor((recipe?.restTime ?? 0) / 60))
    setRestTimeMinutes((recipe?.restTime ?? 0) % 60)
    setServings(recipe?.servings ?? 1)
    setSteps(recipe?.steps ?? [])
  }, [recipe])

  const handleSubmit = async () => {
    const doc = recipe ?? new RecipeModel()
    doc.assign({
      title: title,
      description: description,
      image: image,
      preparationTime: preparationTimeHours * 60 + preparationTimeMinutes,
      cookingTime: cookingTimeHours * 60 + cookingTimeMinutes,
      restTime: restTimeHours * 60 + restTimeMinutes,
      servings: servings,
      steps: steps,
      author: user!.id,
    })

    setIsSaving(true)
    await doc.save()
      .then(() => navigation.replace('Recipe', { id: doc.id }))
      .catch((err) => console.error(err))
      .finally(() => setIsSaving(false))
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>
          {recipe ? 'Modifier une recette' : 'Ajouter une nouvelle recette'}
        </Text>

        <Pressable
          onPress={() => {
            launchImageLibraryAsync({
              mediaTypes: MediaTypeOptions.All,
              quality: 1,
            })
              .then((result) => {
                if (!result.canceled) {
                  setImage(result.assets[0].uri)
                }
              })
              .catch((err) => console.error(err))
          }}
          style={styles.imagePicker}
        >
          {image ? (<>
            <AutoHeightImage
              source={{ uri: image ?? undefined }}
              resizeMode="contain"
              style={{ borderRadius: styles.imagePicker.borderRadius }}
            />
            <MaterialIcons
              name="close"
              size={16}
              color="#000"
              onPress={() => setImage(null)}
              style={styles.imageRemoveButton}
            />
          </>) : (
            <View style={styles.pickImage}>
              <MaterialIcons
                name="cloud-upload"
                size={30}
                color="#000"
              />
              <Text style={styles.pickImageText}>
                Ajouter une photo
              </Text>
            </View>
          )}
        </Pressable>

        <TextInput
          label="Nom"
          value={title}
          onChangeText={(value) => setTitle(value)}
          style={styles.name}
        />

        <TextInput
          label="Description"
          value={description}
          onChangeText={(value) => setDescription(value)}
          multiline
          style={styles.description}
        />

        <View
          style={{
            marginHorizontal: 16,
            marginTop: 16,
          }}
        >
          <TextInputLabel>
            Temps de préparation
          </TextInputLabel>

          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: 10,
            }}
          >
            <TextInput
              value={preparationTimeHours.toString()}
              onChangeText={(value) => setPreparationTimeHours(+value.replace(/[^0-9]/g, ''))}
              placeholder="00"
              inputMode="numeric"
              textAlign="center"
              style={{ flex: 1 }}
            />
            <Text
              style={{
                color: '#888',
                fontSize: 16,
              }}
            >
              h
            </Text>
            <TextInput
              value={preparationTimeMinutes.toString()}
              onChangeText={(value) => setPreparationTimeMinutes(+value.replace(/[^0-9]/g, ''))}
              placeholder="00"
              inputMode="numeric"
              textAlign="center"
              style={{ flex: 1 }}
            />
          </View>
        </View>

        <View
          style={{
            marginHorizontal: 16,
            marginTop: 16,
          }}
        >
          <TextInputLabel>
            Temps de cuisson
          </TextInputLabel>

          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: 10,
            }}
          >
            <TextInput
              value={cookingTimeHours.toString()}
              onChangeText={(value) => setCookingTimeHours(+value.replace(/[^0-9]/g, ''))}
              placeholder="00"
              inputMode="numeric"
              textAlign="center"
              style={{ flex: 1 }}
            />
            <Text
              style={{
                color: '#888',
                fontSize: 16,
              }}
            >
              h
            </Text>
            <TextInput
              value={cookingTimeMinutes.toString()}
              onChangeText={(value) => setCookingTimeMinutes(+value.replace(/[^0-9]/g, ''))}
              placeholder="00"
              inputMode="numeric"
              textAlign="center"
              style={{ flex: 1 }}
            />
          </View>
        </View>

        <View
          style={{
            marginHorizontal: 16,
            marginTop: 16,
          }}
        >
          <TextInputLabel>
            Temps de repos
          </TextInputLabel>

          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: 10,
            }}
          >
            <TextInput
              value={restTimeHours.toString()}
              onChangeText={(value) => setRestTimeHours(+value.replace(/[^0-9]/g, ''))}
              placeholder="00"
              inputMode="numeric"
              textAlign="center"
              style={{ flex: 1 }}
            />
            <Text
              style={{
                color: '#888',
                fontSize: 16,
              }}
            >
              h
            </Text>
            <TextInput
              value={restTimeMinutes.toString()}
              onChangeText={(value) => setRestTimeMinutes(+value.replace(/[^0-9]/g, ''))}
              placeholder="00"
              inputMode="numeric"
              textAlign="center"
              style={{ flex: 1 }}
            />
          </View>
        </View>

        <TextInput
          label="Nombre de portions"
          value={servings.toString()}
          onChangeText={(value) => setServings(+value.replace(/[^0-9]/g, ''))}
          placeholder="0"
          inputMode="numeric"
          textAlign="center"
          style={{
            marginHorizontal: 16,
            marginTop: 16,
          }}
        />

        <Text style={styles.stepsTitle}>
          Étapes {`(${steps.length})`}
        </Text>

        {steps.map((step, index) => (
          <View
            key={`step-${index}`}
          >
            <View style={styles.step}>
              <Text style={styles.stepTitle}>
                Étape {index + 1}
              </Text>

              <MaterialIcons
                name="remove-circle-outline"
                size={24}
                color="#000"
                onPress={() => setSteps((prev) => {
                  const newState = [...prev]
                  newState.splice(index, 1)
                  return newState
                })}
              />
            </View>

            <TextInput
              label="Titre"
              value={step.title}
              onChangeText={(value) => setSteps((prev) => {
                const newState = [...prev]
                newState[index].title = value
                return newState
              })}
              style={{
                marginHorizontal: 24,
                marginTop: 12,
              }}
            />

            <Text style={styles.stepSubTitle}>
              Ingrédients
            </Text>

            {step.ingredients.map((ingredient, i) => (
              <View
                key={`step-${index}-ingredient-${i}`}
                style={styles.ingredient}
              >
                <View style={{ flex: 1 }}>
                  <TextInput
                    label="Ingrédient"
                    value={ingredient.name}
                    onChangeText={(value) => setSteps((prev) => {
                      const newState = [...prev]
                      newState[index].ingredients[i].name = value
                      return newState
                    })}
                  />

                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 14,
                      marginTop: 4,
                    }}
                  >
                    <TextInput
                      label="Quantité"
                      value={ingredient.quantity.toString()}
                      onChangeText={(value) => setSteps((prev) => {
                        const newState = [...prev]
                        newState[index].ingredients[i].quantity = +value
                        return newState
                      })}
                      inputMode='numeric'
                      style={{ flex: 1 }}
                    />

                    <TextInput
                      label="Mesure"
                      value={ingredient.unit}
                      onChangeText={(value) => setSteps((prev) => {
                        const newState = [...prev]
                        newState[index].ingredients[i].unit = value
                        return newState
                      })}
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>

                <MaterialIcons
                  name="remove-circle-outline"
                  size={24}
                  color="#000"
                  onPress={() => setSteps((prev) => {
                    const newState = [...prev]
                    newState[index].ingredients.splice(i, 1)
                    return newState
                  })}
                />
              </View>
            ))}

            <Pressable
              onPress={() => setSteps((prev) => {
                const newState = [...prev]
                newState[index].ingredients.push({
                  quantity: 0,
                  unit: '',
                  name: '',
                })
                return newState
              })}
              style={[styles.addButton, { marginHorizontal: 32 }]}
            >
              <Text style={styles.addButtonLabel}>
                Ajouter un ingrédient
              </Text>
              <MaterialIcons name="add-circle-outline" size={24} color="#000" />
            </Pressable>


            <Text style={styles.stepSubTitle}>
              Instructions
            </Text>

            {step.actions.map((action, i) => (
              <View
                key={`step-${index}-action-${i}`}
                style={styles.action}
              >
                <TextInput
                  label={`Instruction ${i + 1}`}
                  value={action}
                  onChangeText={(value) => setSteps((prev) => {
                    const newState = [...prev]
                    newState[index].actions[i] = value
                    return newState
                  })}
                  multiline
                  style={{ flex: 1 }}
                />

                <MaterialIcons
                  name="remove-circle-outline"
                  size={24}
                  color="#000"
                  onPress={() => setSteps((prev) => {
                    const newState = [...prev]
                    newState[index].actions.splice(i, 1)
                    return newState
                  })}
                />
              </View>
            ))}

            <Pressable
              onPress={() => setSteps((prev) => {
                const newState = [...prev]
                newState[index].actions.push('')
                return newState
              })}
              style={[styles.addButton, { marginHorizontal: 32 }]}
            >
              <Text style={styles.addButtonLabel}>
                Ajouter une instruction
              </Text>
              <MaterialIcons name="add-circle-outline" size={24} color="#000" />
            </Pressable>
          </View>
        ))}

        <Pressable
          onPress={() => setSteps((prev) => {
            const newState = [...prev]
            newState.push({
              title: '',
              ingredients: [],
              actions: [],
            })
            return newState
          })}
          style={[styles.addButton, { marginHorizontal: 16 }]}
        >
          <Text style={styles.addButtonLabel}>
            Ajouter une étape
          </Text>
          <MaterialIcons name="add-circle-outline" size={24} color="#000" />
        </Pressable>

        <View style={{ height: 16 }} />
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={() => handleSubmit()}
          style={styles.footerButton}
        >
          <Text style={styles.footerButtonText}>
            {recipe ? 'Sauvegarder' : 'Publier'} ma recette
          </Text>
          <ActivityIndicator
            animating={isSaving}
            color='#FFFFFF'
          />
        </Pressable>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  imagePicker: {
    minHeight: 200,
    borderColor: '#EAEDE8',
    borderRadius: 4,
    borderWidth: 3,
    marginHorizontal: 16,
    marginTop: 16,
  },
  imageRemoveButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EAEDE8',
    borderRadius: 360,
    margin: 10,
    padding: 6,
  },
  pickImage: {
    alignItems: 'center',
    flex: 1,
    gap: 10,
    justifyContent: 'center',
    padding: 16,
  },
  pickImageText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  name: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  description: {
    height: 150,
    marginHorizontal: 16,
    marginTop: 16,
  },
  stepsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 32,
    textAlign: 'center'
  },
  step: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    marginHorizontal: 16,
    marginTop: 24,
  },
  stepTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
  },
  stepSubTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 24,
    marginTop: 18,
  },
  ingredient: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    marginHorizontal: 32,
    marginTop: 16,
  },
  action: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    marginHorizontal: 32,
    marginTop: 16,
  },
  addButton: {
    backgroundColor: '#f6f6f6',
    borderRadius: 6,
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonLabel: {
    flex: 1,
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: -1, height: -1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  footerButton: {
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 10,
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    margin: 16,
    padding: 16,
  },
  footerButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
})