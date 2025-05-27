import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import TextInput from '../../../components/atoms/TextInput'
import { IStep } from '../../../models/recipe.model'
import IngredientInput from './IngredientInput'
import InstructionInput from './InstructionInput'

type Props = {
  number: number
  step: IStep
  onStepChange: (step: IStep) => void
  onStepDelete: () => void
  onMoveStepUp: () => void
  onMoveStepDown: () => void
}

export default function StepInput({
  number,
  step,
  onStepChange,
  onStepDelete,
  onMoveStepUp,
  onMoveStepDown,
}: Props) {
  return (
    <View>
      <View style={styles.container}>
        <Text style={styles.title}>
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

      <Text style={styles.subtitle}>
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


      <Text style={styles.subtitle}>
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

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    marginLeft: 16,
    marginRight: 16,
    marginTop: 24,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 24,
    marginTop: 18,
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
})