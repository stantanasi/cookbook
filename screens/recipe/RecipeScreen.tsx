import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import AutoHeightImage from '../../components/AutoHeightImage';
import Ingredient from '../../components/Ingredient';
import { AuthContext } from '../../contexts/AuthContext';
import RecipeModel, { IRecipe } from '../../models/recipe.model';
import { IUser } from '../../models/user.model';
import { RootStackParamList } from '../../navigation/types';
import { Model } from '../../utils/database/model';
import RecipeStepsModal from './RecipeStepsModal';

type Props = NativeStackScreenProps<RootStackParamList, 'Recipe'>;

export default function RecipeScreen({ navigation, route }: Props) {
  const { isAuthenticated } = useContext(AuthContext)
  const [recipe, setRecipe] = useState<Model<IRecipe> & { author: Model<IUser> }>()
  const [servings, setServings] = useState(0)
  const [showRecipeDeleteModal, setShowRecipeDeleteModal] = useState(false)
  const [showSteps, setShowSteps] = useState(false)

  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchRecipe = async () => {
      const recipe = await RecipeModel.findById(route.params.id)
        .populate<{ author: Model<IUser> }>('author')

      if (!recipe) {
        navigation.replace('NotFound')
        return
      }

      navigation.setOptions({
        title: recipe.title,
      })

      setRecipe(recipe)
      setServings(recipe.servings)
    }

    fetchRecipe()
  }, [route.params.id])

  if (!recipe) {
    return (
      <View></View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View>
          <AutoHeightImage
            source={{ uri: recipe.image ?? undefined }}
            style={styles.image}
          />

          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              flexDirection: 'row',
              gap: 16,
              margin: 16,
            }}
          >
            <MaterialIcons
              name="share"
              size={24}
              color="#000"
              onPress={async () => {
                await Share.share({
                  title: recipe.title,
                  message: `https://stantanasi.github.io/cookbook/recipe/${recipe.id}`,
                })
              }}
              style={{
                backgroundColor: '#fff',
                borderRadius: 360,
                padding: 8,
              }}
            />

            {isAuthenticated && (<>
              <MaterialIcons
                name="edit"
                size={24}
                color="#000"
                onPress={() => navigation.navigate('RecipeSave', { id: route.params.id })}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 360,
                  padding: 8,
                }}
              />
              <MaterialIcons
                name="delete"
                size={24}
                color="#f4212e"
                onPress={() => setShowRecipeDeleteModal(true)}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 360,
                  padding: 8,
                }}
              />

              <Modal
                animationType="fade"
                onRequestClose={() => setShowRecipeDeleteModal(false)}
                transparent
                visible={showRecipeDeleteModal}
              >
                <Pressable
                  onPress={() => setShowRecipeDeleteModal(false)}
                  style={{
                    alignItems: 'center',
                    backgroundColor: '#00000052',
                    flex: 1,
                    justifyContent: 'center',
                  }}
                >
                  <Pressable
                    style={{
                      width: '90%',
                      alignItems: 'center',
                      backgroundColor: '#fff',
                      borderRadius: 10,
                      padding: 20,
                    }}
                  >
                    <MaterialIcons
                      name="close"
                      size={24}
                      color="black"
                      onPress={() => setShowRecipeDeleteModal(false)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        margin: 16,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 22,
                        fontWeight: 'bold',
                      }}
                    >
                      Supprimer la recette
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        marginTop: 16,
                        textAlign: 'center',
                      }}
                    >
                      <Text>Êtes-vous sûr de vouloir supprimer la recette </Text>
                      <Text style={{ fontWeight: 'bold' }}>{recipe.title}</Text>
                      <Text> ?</Text>
                    </Text>
                    <Pressable
                      onPress={async () => {
                        setIsDeleting(true)
                        await recipe.delete()
                          .then(() => {
                            setShowRecipeDeleteModal(false)
                            navigation.replace('Home')
                          })
                          .catch((err) => console.error(err))
                          .finally(() => setIsDeleting(false))
                      }}
                      style={{
                        alignItems: 'center',
                        backgroundColor: '#f4212e',
                        borderRadius: 360,
                        flexDirection: 'row',
                        gap: 12,
                        justifyContent: 'center',
                        marginTop: 26,
                        paddingHorizontal: 24,
                        paddingVertical: 10,
                      }}
                    >
                      <Text
                        style={{
                          color: '#fff',
                          fontSize: 18,
                          fontWeight: 'bold',
                        }}
                      >
                        Supprimer
                      </Text>
                      {isDeleting && (
                        <ActivityIndicator
                          animating
                          color='#fff'
                        />
                      )}
                    </Pressable>
                  </Pressable>
                </Pressable>
              </Modal>
            </>
            )}
          </View>
        </View>

        <Text style={styles.title}>
          {recipe.title}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            marginHorizontal: 16,
            marginTop: 2,
          }}
        >
          <Text style={styles.subtitle}>
            {new Date(recipe.updatedAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
          <Text style={styles.subtitle}>
            {' • Par '}
          </Text>
          <Text
            onPress={() => navigation.navigate('Profile', { id: recipe.author.id })}
            style={[styles.subtitle, { fontWeight: 'bold', textDecorationLine: 'underline' }]}
          >
            {recipe.author.name}
          </Text>
        </View>

        <Text style={styles.description}>
          {recipe.description}
        </Text>

        <View style={styles.metas}>
          <View style={styles.meta}>
            <Text style={styles.metaLabel}>
              Personnes
            </Text>
            <View style={{
              alignItems: 'center',
              flex: 1,
              flexDirection: 'row',
              gap: 8,
            }}>
              <MaterialIcons
                name="remove"
                size={14}
                color="#000"
                onPress={() => setServings((prev) => prev - 1)}
                style={styles.servingsIncrementButton}
              />
              <Text>
                {servings}
              </Text>
              <MaterialIcons
                name="add"
                size={14}
                color="#000"
                onPress={() => setServings((prev) => prev + 1)}
                style={styles.servingsIncrementButton}
              />
            </View>
          </View>
          <View style={styles.meta}>
            <Text style={styles.metaLabel}>
              Préparation
            </Text>
            <Text style={styles.metaValue}>
              {(() => {
                const duration = Math.floor(recipe.preparationTime * (servings / recipe.servings))
                const hours = Math.floor(duration / 60)
                const minutes = duration % 60
                return `${hours ? `${hours} h ` : ''}${minutes ? `${minutes} min` : ''}` || '-'
              })()}
            </Text>
          </View>
          <View style={styles.meta}>
            <Text style={styles.metaLabel}>
              Cuisson
            </Text>
            <Text style={styles.metaValue}>
              {(() => {
                const duration = Math.floor(recipe.cookingTime * (servings / recipe.servings))
                const hours = Math.floor(duration / 60)
                const minutes = duration % 60
                return `${hours ? `${hours} h ` : ''}${minutes ? `${minutes} min` : ''}` || '-'
              })()}
            </Text>
          </View>
        </View>

        <View style={styles.ingredients}>
          <Text style={styles.ingredientsTitle}>
            Ingrédients
          </Text>

          <View style={{ gap: 14 }}>
            {recipe.steps
              .filter((step) => step.ingredients.length)
              .map((step, index) => (
                <View
                  key={`${recipe.id}-step-${index}`}
                >
                  {!!step.title && (
                    <Text style={styles.stepTitle}>
                      {step.title}
                    </Text>
                  )}

                  <View style={{ gap: 10 }}>
                    {step.ingredients.map((ingredient, i) => (
                      <Ingredient
                        key={`${recipe.id}-step-${index}-ingredient-${i}`}
                        ingredient={ingredient}
                        portionFactor={servings / recipe.servings}
                        checkbox
                        style={{
                          marginHorizontal: 16,
                        }}
                      />
                    ))}
                  </View>
                </View>
              ))}
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={() => setShowSteps(true)}
          style={styles.footerButton}
        >
          <Text style={styles.footerButtonText}>
            Commencer
          </Text>
        </Pressable>
      </View>

      <RecipeStepsModal
        recipe={recipe}
        portionFactor={servings / recipe.servings}
        hide={() => setShowSteps(false)}
        visible={showSteps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: '100%',
  },
  title: {
    color: '#000000',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginHorizontal: 16,
  },
  subtitle: {
    color: '#a1a1a1',
    fontSize: 12,
  },
  description: {
    color: '#333',
    marginTop: 10,
    marginHorizontal: 16,
  },
  metas: {
    borderRadius: 20,
    borderTopColor: '#EAEAEA',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  meta: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  metaLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  metaValue: {
    alignContent: 'center',
    flex: 1,
  },
  servingsIncrementButton: {
    backgroundColor: '#EAEDE8',
    borderRadius: 360,
    padding: 5,
  },
  ingredients: {
    borderRadius: 20,
    borderTopColor: '#EAEAEA',
    borderTopWidth: 1,
    marginTop: 20,
    paddingTop: 12,
  },
  ingredientsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginHorizontal: 16,
  },
  stepTitle: {
    fontSize: 20,
    marginBottom: 10,
    marginHorizontal: 16,
  },
  footer: {
    backgroundColor: '#fff',
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
    backgroundColor: '#000',
    borderRadius: 10,
    flex: 1,
    margin: 16,
    padding: 16,
  },
  footerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
