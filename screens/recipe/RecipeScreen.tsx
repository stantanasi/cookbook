import { MaterialIcons } from '@expo/vector-icons';
import { StackActions, StaticScreenProps, useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import slugify from 'slugify';
import AutoHeightImage from '../../components/atoms/AutoHeightImage';
import IngredientCard from '../../components/molecules/IngredientCard';
import { useAuth } from '../../contexts/AuthContext';
import Category from '../../models/category.model';
import Cuisine from '../../models/cuisine.model';
import { useAppDispatch } from '../../redux/store';
import { toTimeString } from '../../utils/utils';
import NotFoundScreen from '../not-found/NotFoundScreen';
import { useRecipe } from './hooks/useRecipe';

type Props = StaticScreenProps<{
  id: string;
}>;

export default function RecipeScreen({ route }: Props) {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { recipe, author } = useRecipe(route.params);
  const [servings, setServings] = useState(0);
  const [isOptionsVisible, setOptionsVisible] = useState(false);
  const [showRecipeDeleteModal, setShowRecipeDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!recipe) {
      navigation.setOptions({
        title: 'Page non trouvée',
      });
      return;
    }

    if (route.params.id !== `${recipe.id}-${slugify(recipe.title, { lower: true })}`) {
      navigation.setParams({
        id: `${recipe.id}-${slugify(recipe.title, { lower: true })}`,
      });
    }
    navigation.setOptions({
      title: recipe.title,
    });
  }, [navigation, recipe]);

  useEffect(() => {
    if (!recipe || servings !== 0) return;
    setServings(recipe.servings);
  }, [recipe]);

  if (!recipe) {
    return <NotFoundScreen route={{ params: undefined }} />;
  }

  const deleteRecipe = async () => {
    await recipe.delete(dispatch);

    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.dispatch(
        StackActions.replace('Home')
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>
          {recipe.title}
        </Text>
        <Text style={styles.subtitle}>
          <Text>
            {new Date(recipe.updatedAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
          {author ? (<>
            <Text>
              {' • Par '}
            </Text>
            <Text
              onPress={() => navigation.navigate('Profile', { id: author.id })}
              style={{ fontWeight: 'bold', textDecorationLine: 'underline' }}
            >
              {author.name}
            </Text>
          </>) : null}
        </Text>

        <View style={styles.imageContainer}>
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
              onPress={() => {
                Share.share({
                  title: recipe.title,
                  message: `https://stantanasi.github.io/cookbook/recipe/${recipe.id}`,
                });
              }}
              style={{
                backgroundColor: '#fff',
                borderRadius: 360,
                padding: 8,
              }}
            />

            {(user && recipe.author == user.id) && (<>
              <MaterialIcons
                name="more-horiz"
                size={24}
                color="#000"
                onPress={() => setOptionsVisible(true)}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 360,
                  padding: 8,
                }}
              />

              <Modal
                animationType="fade"
                onRequestClose={() => setOptionsVisible(false)}
                transparent
                visible={isOptionsVisible}
              >
                <Pressable
                  onPress={() => setOptionsVisible(false)}
                  style={{
                    alignItems: 'center',
                    backgroundColor: '#00000052',
                    flex: 1,
                    justifyContent: 'center',
                  }}
                >
                  <View
                    style={{
                      width: '90%',
                      alignItems: 'center',
                      backgroundColor: '#fff',
                      borderRadius: 10,
                    }}
                  >
                    <Text
                      onPress={() => {
                        navigation.navigate('RecipeUpdate', { id: route.params.id });
                        setOptionsVisible(false);
                      }}
                      style={{
                        width: '100%',
                        fontSize: 16,
                        padding: 16,
                        textAlign: 'center',
                      }}
                    >
                      Modifier
                    </Text>
                    <View style={{ width: '100%', height: 1, backgroundColor: '#eaede8' }} />
                    <Text
                      onPress={() => {
                        setShowRecipeDeleteModal(true);
                        setOptionsVisible(false);
                      }}
                      style={{
                        width: '100%',
                        color: '#f4212e',
                        fontSize: 16,
                        fontWeight: 'bold',
                        padding: 16,
                        textAlign: 'center',
                      }}
                    >
                      Supprimer
                    </Text>
                  </View>
                </Pressable>
              </Modal>

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
                      onPress={() => {
                        setIsDeleting(true);

                        deleteRecipe()
                          .then(() => setShowRecipeDeleteModal(false))
                          .catch((err) => console.error(err))
                          .finally(() => setIsDeleting(false));
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

        <Text style={styles.description}>
          {recipe.description}
        </Text>

        <View
          style={{
            height: 1,
            backgroundColor: '#eaeaea',
            marginHorizontal: 16,
            marginTop: 32,
          }}
        />

        <View style={styles.infos}>
          <View style={{ flexDirection: 'row', gap: 10, marginHorizontal: 16 }}>
            <View style={styles.info}>
              <Text style={styles.infoLabel}>
                Préparation
              </Text>
              <Text style={styles.infoValue}>
                {toTimeString(recipe.preparationTime * (servings / recipe.servings))}
              </Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.infoLabel}>
                Repos
              </Text>
              <Text style={styles.infoValue}>
                {toTimeString(recipe.restTime * (servings / recipe.servings))}
              </Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.infoLabel}>
                Cuisson
              </Text>
              <Text style={styles.infoValue}>
                {toTimeString(recipe.cookingTime * (servings / recipe.servings))}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginHorizontal: 16 }}>
            <View style={styles.info}>
              <Text style={styles.infoLabel}>
                Catégorie
              </Text>
              <Text style={styles.infoValue}>
                {recipe.category instanceof Category && recipe.category ? recipe.category.name : '-'}
              </Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.infoLabel}>
                Cuisine
              </Text>
              <Text style={styles.infoValue}>
                {recipe.cuisine instanceof Cuisine && recipe.cuisine ? recipe.cuisine?.name : '-'}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginHorizontal: 16 }}>
            <View style={styles.info}>
              <Text style={styles.infoLabel}>
                Portions
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
                  onPress={() => {
                    if (servings === 1) return;
                    setServings((prev) => prev - 1);
                  }}
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
          </View>
        </View>

        <View
          style={{
            height: 1,
            backgroundColor: '#eaeaea',
            marginHorizontal: 16,
            marginTop: 32,
          }}
        />

        <View style={{ marginTop: 12 }}>
          <Text style={styles.ingredientsTitle}>
            Ingrédients
          </Text>

          <View style={{ gap: 14, marginTop: 16 }}>
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
                      <IngredientCard
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

        <View
          style={{
            height: 1,
            backgroundColor: '#eaeaea',
            marginHorizontal: 16,
            marginTop: 32,
          }}
        />

        <View style={{ marginBottom: 24, marginTop: 12 }}>
          <Text style={styles.instructionsTitle}>
            Instructions
          </Text>

          <View style={{ gap: 24, marginTop: 16 }}>
            {recipe.steps
              .filter((step) => step.instructions.length)
              .map((step, index) => (
                <View
                  key={`${recipe.id}-step-${index}`}
                >
                  {!!step.title && (
                    <Text style={styles.stepTitle}>
                      {step.title}
                    </Text>
                  )}

                  <View style={{ gap: 12 }}>
                    {step.instructions.map((instruction, i) => (
                      <View
                        key={`${recipe.id}-step-${index}-instruction-${i}`}
                        style={{
                          flexDirection: 'row',
                          gap: 10,
                          marginHorizontal: 16,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: 'bold',
                            paddingTop: 2,
                          }}
                        >
                          {i + 1}
                        </Text>

                        <Text
                          style={{
                            fontSize: 16,
                          }}
                        >
                          {instruction.description}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    marginTop: 24,
  },
  image: {
    width: '100%',
  },
  title: {
    color: '#000000',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 16,
    marginHorizontal: 16,
  },
  subtitle: {
    color: '#a1a1a1',
    fontSize: 12,
    marginHorizontal: 16,
    marginTop: 2,
  },
  description: {
    color: '#333',
    marginTop: 24,
    marginHorizontal: 16,
  },
  infos: {
    gap: 20,
    marginTop: 12,
  },
  info: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  infoLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoValue: {
    alignContent: 'center',
    flex: 1,
  },
  servingsIncrementButton: {
    backgroundColor: '#EAEDE8',
    borderRadius: 360,
    padding: 5,
  },
  ingredientsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 16,
  },
  stepTitle: {
    fontSize: 20,
    marginBottom: 10,
    marginHorizontal: 16,
  },
  instructionsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
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
