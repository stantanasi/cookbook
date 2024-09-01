import { MaterialIcons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import { FlatList, Modal, ModalProps, Pressable, StyleSheet, Text, View } from 'react-native'
import Ingredient from '../../components/Ingredient'
import { IRecipe } from '../../models/recipe.model'
import { Model } from '../../utils/database/model'

type Props = ModalProps & {
  recipe: Model<IRecipe>
  portionFactor: number
  hide: () => void
}

export default function RecipeStepsModal({ recipe, portionFactor, hide, ...props }: Props) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isIngredientsVisible, showIngredients] = useState(false)

  useEffect(() => {
    setCurrentStepIndex(0)
  }, [recipe.id])

  if (recipe.steps.length === 0) {
    return (
      <View></View>
    )
  }

  const currentStep = recipe.steps.at(currentStepIndex)

  if (!currentStep) {
    return (
      <View></View>
    )
  }

  return (
    <Modal
      animationType='slide'
      {...props}
      onRequestClose={() => hide()}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              marginHorizontal: 16,
              marginTop: 16,
            }}
          >
            {recipe.steps.map((_, index) => (
              <View
                key={index}
                style={{
                  height: 2,
                  backgroundColor: index === currentStepIndex ? '#000' : '#EAEDE8',
                  flex: 1,
                }}
              />
            ))}
          </View>

          <View
            style={{
              justifyContent: 'space-between',
              flexDirection: 'row',
              marginHorizontal: 16,
              marginTop: 10,
            }}
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color="#000"
              onPress={() => hide()}
            />

            <Pressable
              onPress={() => showIngredients((prev) => !prev)}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <MaterialIcons name="list" size={24} color="#000" />
              <Text>
                {isIngredientsVisible ? 'Cacher' : 'Afficher'} la liste des ingrédients
              </Text>
            </Pressable>
          </View>

          {(isIngredientsVisible && currentStep.ingredients.length > 0) && (
            <View style={styles.ingredients}>
              {currentStep.ingredients.map((ingredient, index) => (
                <Ingredient
                  key={`ingredient-${index}`}
                  ingredient={ingredient}
                  portionFactor={portionFactor}
                />
              ))}
            </View>
          )}

          <Text style={styles.headerTitle}>
            {recipe.steps.length === 1
              ? currentStep.title || recipe.title
              : [`Étape ${currentStepIndex + 1}`, currentStep.title]
                .filter((str) => str).join(' : ')}
          </Text>
        </View>

        <FlatList
          data={currentStep.actions}
          keyExtractor={(_, index) => `action-${index}`}
          renderItem={({ item, index }) => (
            <View
              style={{
                marginHorizontal: 16,
              }}
            >
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  gap: 10,
                }}
              >
                <Text>
                  {index + 1}
                </Text>
                <View
                  style={{
                    borderColor: '#000',
                    borderRadius: 1,
                    borderStyle: 'dashed',
                    borderWidth: 0.3,
                    flex: 1,
                  }}
                />
              </View>

              <Text
                style={{
                  fontSize: 18,
                  marginTop: 4,
                }}
              >
                {item}
              </Text>
            </View>
          )}
          style={{ flex: 1 }}
          ListHeaderComponent={() => <View style={{ height: 22 }} />}
          ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
          ListFooterComponent={() => <View style={{ height: 22 }} />}
        />

        <View style={styles.footer}>
          <Pressable
            onPress={() => setCurrentStepIndex((prev) => prev - 1)}
            disabled={currentStepIndex == 0}
            style={styles.footerButton}
          >
            <MaterialIcons name="arrow-back" size={14} color="#fff" />
            <Text style={styles.footerButtonText}>
              Étape précédente
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setCurrentStepIndex((prev) => prev + 1)}
            disabled={currentStepIndex == recipe.steps.length - 1}
            style={styles.footerButton}
          >
            <Text style={styles.footerButtonText}>
              Étape suivante
            </Text>
            <MaterialIcons name="arrow-forward" size={14} color="#fff" />
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  ingredients: {
    gap: 10,
    marginHorizontal: 16,
    marginTop: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 30,
    paddingBottom: 10,
  },
  footer: {
    backgroundColor: '#fff',
    elevation: 5,
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: -1, height: -1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  footerButton: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#000',
    borderRadius: 6,
    gap: 10,
    justifyContent: 'center',
    padding: 12,
  },
  footerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
})