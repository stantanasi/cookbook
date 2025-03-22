import { MaterialIcons } from '@expo/vector-icons'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker'
import React, { useContext, useEffect, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import slugify from 'slugify'
import { toast } from 'sonner'
import AutoHeightImage from '../../components/atoms/AutoHeightImage'
import NumberInput from '../../components/atoms/NumberInput'
import SelectInput from '../../components/atoms/SelectInput'
import TextInput from '../../components/atoms/TextInput'
import TimeInput from '../../components/atoms/TimeInput'
import { AuthContext } from '../../contexts/AuthContext'
import Category from '../../models/category.model'
import Cuisine from '../../models/cuisine.model'
import Recipe, { IIngredient, IInstruction, IRecipe, IStep } from '../../models/recipe.model'
import { RootStackParamList } from '../../navigation/types'
import { ModelValidationError } from '../../utils/mongoose'
import { isEmpty } from '../../utils/utils'

const StepInput = ({ number, step, onStepChange, onStepDelete, onMoveStepUp, onMoveStepDown }: {
  number: number
  step: IStep
  onStepChange: (step: IStep) => void
  onStepDelete: () => void
  onMoveStepUp: () => void
  onMoveStepDown: () => void
}) => {
  return (
    <View>
      <View style={styles.step}>
        <Text style={styles.stepTitle}>
          Étape {number}
        </Text>

        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            gap: 4,
          }}
        >
          <View style={{ gap: 14 }}>
            <MaterialIcons
              name="arrow-circle-up"
              size={24}
              color="#888"
              onPress={() => onMoveStepUp()}
            />
            <MaterialIcons
              name="arrow-circle-down"
              size={24}
              color="#888"
              onPress={() => onMoveStepDown()}
            />
          </View>

          <MaterialIcons
            name="remove-circle-outline"
            size={24}
            color="#000"
            onPress={() => onStepDelete()}
          />
        </View>
      </View>

      <TextInput
        label="Titre"
        value={step.title}
        onChangeText={(value) => onStepChange({
          ...step,
          title: value,
        })}
        style={{
          marginHorizontal: 24,
          marginTop: 12,
        }}
      />

      <Text style={styles.stepSubTitle}>
        Ingrédients
      </Text>

      {step.ingredients.map((ingredient, index) => (
        <IngredientInput
          key={`step-${number}-ingredient-${index}`}
          ingredient={ingredient}
          onIngredientChange={(ingredient) => onStepChange({
            ...step,
            ingredients: step.ingredients.toSpliced(index, 1, ingredient),
          })}
          onIngredientDelete={() => onStepChange({
            ...step,
            ingredients: step.ingredients.toSpliced(index, 1),
          })}
          onMoveIngredientUp={() => {
            if (index == 0) return
            onStepChange({
              ...step,
              ingredients: step.ingredients.toSpliced(index, 1).toSpliced(index - 1, 0, ingredient),
            })
          }}
          onMoveIngredientDown={() => {
            if (index >= step.ingredients.length - 1) return
            onStepChange({
              ...step,
              ingredients: step.ingredients.toSpliced(index, 1).toSpliced(index + 1, 0, ingredient),
            })
          }}
        />
      ))}

      <Pressable
        onPress={() => onStepChange({
          ...step,
          ingredients: step.ingredients.concat({
            quantity: 0,
            unit: '',
            name: '',
          }),
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

      {step.instructions.map((instruction, index) => (
        <InstructionInput
          key={`step-${number}-instruction-${index}`}
          number={index + 1}
          instruction={instruction}
          onInstructionChange={(instruction) => onStepChange({
            ...step,
            instructions: step.instructions.toSpliced(index, 1, instruction),
          })}
          onInstructionDelete={() => onStepChange({
            ...step,
            instructions: step.instructions.toSpliced(index, 1),
          })}
          onMoveInstructionUp={() => {
            if (index == 0) return
            onStepChange({
              ...step,
              instructions: step.instructions.toSpliced(index, 1).toSpliced(index - 1, 0, instruction),
            })
          }}
          onMoveInstructionDown={() => {
            if (index >= step.instructions.length - 1) return
            onStepChange({
              ...step,
              instructions: step.instructions.toSpliced(index, 1).toSpliced(index + 1, 0, instruction),
            })
          }}
        />
      ))}

      <Pressable
        onPress={() => onStepChange({
          ...step,
          instructions: step.instructions.concat({
            description: '',
          }),
        })}
        style={[styles.addButton, { marginHorizontal: 32 }]}
      >
        <Text style={styles.addButtonLabel}>
          Ajouter une instruction
        </Text>
        <MaterialIcons name="add-circle-outline" size={24} color="#000" />
      </Pressable>
    </View>
  )
}

const IngredientInput = ({ ingredient, onIngredientChange, onIngredientDelete, onMoveIngredientUp, onMoveIngredientDown }: {
  ingredient: IIngredient
  onIngredientChange: (ingredient: IIngredient) => void
  onIngredientDelete: () => void
  onMoveIngredientUp: () => void
  onMoveIngredientDown: () => void
}) => {
  return (
    <View style={styles.ingredient}>
      <View style={{ flex: 1 }}>
        <TextInput
          label="Ingrédient"
          value={ingredient.name}
          onChangeText={(value) => onIngredientChange({
            ...ingredient,
            name: value,
          })}
        />

        <View
          style={{
            flexDirection: 'row',
            gap: 14,
            marginTop: 4,
          }}
        >
          <NumberInput
            label="Quantité"
            value={ingredient.quantity}
            onChangeValue={(value) => onIngredientChange({
              ...ingredient,
              quantity: value,
            })}
            inputMode="decimal"
            decimal
            negative={false}
            style={{ flex: 1 }}
          />

          <TextInput
            label="Mesure"
            value={ingredient.unit}
            onChangeText={(value) => onIngredientChange({
              ...ingredient,
              unit: value,
            })}
            autoCapitalize="none"
            style={{ flex: 1 }}
          />
        </View>
      </View>

      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: 4,
        }}
      >
        <View style={{ gap: 14 }}>
          <MaterialIcons
            name="arrow-circle-up"
            size={24}
            color="#888"
            onPress={() => onMoveIngredientUp()}
          />
          <MaterialIcons
            name="arrow-circle-down"
            size={24}
            color="#888"
            onPress={() => onMoveIngredientDown()}
          />
        </View>

        <MaterialIcons
          name="remove-circle-outline"
          size={24}
          color="#000"
          onPress={() => onIngredientDelete()}
        />
      </View>
    </View>
  )
}

const InstructionInput = ({ number, instruction, onInstructionChange, onInstructionDelete, onMoveInstructionUp, onMoveInstructionDown }: {
  number: number
  instruction: IInstruction
  onInstructionChange: (instruction: IInstruction) => void
  onInstructionDelete: () => void
  onMoveInstructionUp: () => void
  onMoveInstructionDown: () => void
}) => {
  return (
    <View style={styles.instruction}>
      <TextInput
        label={`Instruction ${number}`}
        value={instruction.description}
        onChangeText={(value) => onInstructionChange({
          ...instruction,
          description: value,
        })}
        multiline
        style={{ flex: 1 }}
      />

      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: 4,
        }}
      >
        <View style={{ gap: 14 }}>
          <MaterialIcons
            name="arrow-circle-up"
            size={24}
            color="#888"
            onPress={() => onMoveInstructionUp()}
          />
          <MaterialIcons
            name="arrow-circle-down"
            size={24}
            color="#888"
            onPress={() => onMoveInstructionDown()}
          />
        </View>

        <MaterialIcons
          name="remove-circle-outline"
          size={24}
          color="#000"
          onPress={() => onInstructionDelete()}
        />
      </View>
    </View>
  )
}


type Props = NativeStackScreenProps<RootStackParamList, 'RecipeCreate' | 'RecipeUpdate'>

export default function RecipeSaveScreen({ navigation, route }: Props) {
  const { user } = useContext(AuthContext)
  const [categories, setCategories] = useState<Category[]>([])
  const [cuisines, setCuisines] = useState<Cuisine[]>([])
  const [recipe, setRecipe] = useState<Recipe>()
  const [form, setForm] = useState<IRecipe>(undefined as any)
  const [errors, setErrors] = useState<ModelValidationError<IRecipe>>({})
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchRecipe = async () => {
      setIsLoading(true)

      const categories = await Category.find()
      setCategories(categories)

      const cuisines = await Cuisine.find()
        .sort({ name: 'asc' })
      setCuisines(cuisines)

      let recipe = new Recipe({
        id: await Recipe.find()
          .then((recipes) => {
            const ids = recipes.map((recipe) => recipe.id)
            const max = Math.max(...ids)
            return max + 1
          }),
        author: user!.id,
      })
      if (route.params) {
        const result = await Recipe.findById(route.params.id.split('-').shift())

        if (!result) {
          navigation.replace('NotFound')
          return
        }

        recipe = result
        navigation.setParams({
          id: `${recipe.id}-${slugify(recipe.title, { lower: true })}`,
        })
      }

      navigation.setOptions({
        title: recipe.isNew
          ? 'Publier une nouvelle recette'
          : `${recipe.title} - Éditer`,
      })

      setRecipe(recipe)
      setForm(recipe.toObject())
      setIsLoading(false)
    }

    fetchRecipe()
  }, [route.params?.id])

  if (isLoading || !recipe || !form) {
    return (
      <View
        style={{
          alignItems: 'center',
          flex: 1,
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator
          animating
          color="#000"
          size="large"
        />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>
          {recipe.isNew ? 'Ajouter une nouvelle recette' : 'Modifier une recette'}
        </Text>

        <Pressable
          onPress={() => {
            launchImageLibraryAsync({
              mediaTypes: MediaTypeOptions.All,
              quality: 1,
            })
              .then((result) => {
                if (!result.canceled) {
                  setForm((prev) => ({
                    ...prev,
                    image: result.assets[0].uri,
                  }))
                }
              })
              .catch((err) => console.error(err))
          }}
          style={styles.imagePicker}
        >
          {form.image ? (<>
            <AutoHeightImage
              source={{ uri: form.image ?? undefined }}
              resizeMode="contain"
              style={{ borderRadius: styles.imagePicker.borderRadius }}
            />
            <MaterialIcons
              name="close"
              size={16}
              color="#000"
              onPress={() => setForm((prev) => ({
                ...prev,
                image: null,
              }))}
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
          value={form.title}
          onChangeText={(value) => setForm((prev) => ({
            ...prev,
            title: value,
          }))}
          error={errors.title ? 'Le nom de la recette ne peut pas être vide' : undefined}
          style={styles.name}
        />

        <TextInput
          label="Description"
          value={form.description}
          onChangeText={(value) => setForm((prev) => ({
            ...prev,
            description: value,
          }))}
          multiline
          style={styles.description}
        />

        <SelectInput
          label="Catégorie"
          selectedValue={form.category}
          onValueChange={(value) => setForm((prev) => ({
            ...prev,
            category: value,
          }))}
          values={categories.map((category) => ({
            key: category.id.toString(),
            label: category.name,
            value: category.id,
          }))}
          style={{
            marginHorizontal: 16,
            marginTop: 16,
          }}
        />

        <SelectInput
          label="Cuisine"
          selectedValue={form.cuisine}
          onValueChange={(value) => setForm((prev) => ({
            ...prev,
            cuisine: value,
          }))}
          values={cuisines.map((cuisine) => ({
            key: cuisine.id.toString(),
            label: cuisine.name,
            value: cuisine.id,
          }))}
          style={{
            marginHorizontal: 16,
            marginTop: 16,
          }}
        />

        <TimeInput
          label="Temps de préparation"
          value={form.preparationTime}
          onChangeValue={(value) => setForm((prev) => ({
            ...prev,
            preparationTime: value,
          }))}
          style={{
            marginHorizontal: 16,
            marginTop: 16,
          }}
        />

        <TimeInput
          label="Temps de repos"
          value={form.restTime}
          onChangeValue={(value) => setForm((prev) => ({
            ...prev,
            restTime: value,
          }))}
          style={{
            marginHorizontal: 16,
            marginTop: 16,
          }}
        />

        <TimeInput
          label="Temps de cuisson"
          value={form.cookingTime}
          onChangeValue={(value) => setForm((prev) => ({
            ...prev,
            cookingTime: value,
          }))}
          style={{
            marginHorizontal: 16,
            marginTop: 16,
          }}
        />

        <NumberInput
          label="Nombre de portions"
          value={form.servings}
          onChangeValue={(value) => setForm((prev) => ({
            ...prev,
            servings: value,
          }))}
          placeholder="0"
          inputMode="numeric"
          decimal={false}
          negative={false}
          textAlign="center"
          style={{
            marginHorizontal: 16,
            marginTop: 16,
          }}
        />

        <Text style={styles.stepsTitle}>
          Étapes {`(${form.steps.length})`}
        </Text>

        {form.steps.map((step, index) => (
          <StepInput
            key={`step-${index}`}
            number={index + 1}
            step={step}
            onStepChange={(step) => setForm((prev) => ({
              ...prev,
              steps: prev.steps.toSpliced(index, 1, step),
            }))}
            onStepDelete={() => setForm((prev) => ({
              ...prev,
              steps: prev.steps.toSpliced(index, 1),
            }))}
            onMoveStepUp={() => {
              if (index == 0) return
              setForm((prev) => ({
                ...prev,
                steps: prev.steps.toSpliced(index, 1).toSpliced(index - 1, 0, step),
              }))
            }}
            onMoveStepDown={() => {
              if (index >= form.steps.length - 1) return
              setForm((prev) => ({
                ...prev,
                steps: prev.steps.toSpliced(index, 1).toSpliced(index + 1, 0, step),
              }))
            }}
          />
        ))}

        <Pressable
          onPress={() => setForm((prev) => ({
            ...prev,
            steps: prev.steps.concat({
              title: '',
              ingredients: [],
              instructions: [],
            })
          }))}
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
          onPress={async () => {
            recipe.assign(form)

            const errors = recipe.validate() ?? {}
            setErrors(errors)
            if (!isEmpty(errors)) {
              return
            }

            setIsSaving(true)
            await recipe.save()
              .then(() => navigation.replace('Recipe', { id: recipe.id.toString() }))
              .catch((err) => {
                console.error(err)
                toast.error("Échec de l'enregistrement de la recette", {
                  description: err.message || "Une erreur inattendue s'est produite",
                })
              })
              .finally(() => setIsSaving(false))
          }}
          style={styles.footerButton}
        >
          <Text style={styles.footerButtonText}>
            Publier ma recette
          </Text>
          <ActivityIndicator
            animating={isSaving}
            color='#FFFFFF'
          />
        </Pressable>

        <MaterialIcons
          name="more-vert"
          size={24}
          color="#000"
          onPress={() => setMoreOptionsOpen(true)}
        />
        <Modal
          animationType="fade"
          onRequestClose={() => setMoreOptionsOpen(false)}
          transparent
          visible={moreOptionsOpen}
        >
          <Pressable
            onPress={() => setMoreOptionsOpen(false)}
            style={{
              alignItems: 'flex-end',
              backgroundColor: '#00000052',
              flex: 1,
              justifyContent: 'flex-end',
            }}
          >
            <View
              style={{
                backgroundColor: '#fff',
                elevation: 5,
                margin: 16,
                shadowColor: '#000',
                shadowOffset: { width: 1, height: 1 },
                shadowOpacity: 0.4,
                shadowRadius: 3,
              }}
            >
              <Text
                onPress={async () => {
                  recipe.assign(form)

                  const errors = recipe.validate() ?? {}
                  setErrors(errors)
                  if (!isEmpty(errors)) {
                    setMoreOptionsOpen(false)
                    return
                  }

                  await recipe.save({ asDraft: true })
                    .then(() => setMoreOptionsOpen(false))
                    .catch((err) => {
                      console.error(err)
                      toast.error("Échec de l'enregistrement de la recette", {
                        description: err.message || "Une erreur inattendue s'est produite",
                      })
                    })
                }}
                style={{
                  fontSize: 16,
                  padding: 16,
                }}
              >
                Enregistrer en tant que brouillon
              </Text>
            </View>
          </Pressable>
        </Modal>
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
    marginLeft: 16,
    marginRight: 16,
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
    marginLeft: 32,
    marginRight: 16,
    marginTop: 16,
  },
  instruction: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    marginLeft: 32,
    marginRight: 16,
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
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    padding: 16,
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
    padding: 16,
  },
  footerButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
})