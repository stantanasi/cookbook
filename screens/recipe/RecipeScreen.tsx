import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useContext, useEffect, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import AutoHeightImage from '../../components/AutoHeightImage';
import Ingredient from '../../components/Ingredient';
import { AuthContext } from '../../contexts/AuthContext';
import RecipeModel, { IRecipe } from '../../models/recipe.model';
import UserModel from '../../models/user.model';
import { RootStackParamList } from '../../navigation/types';
import { Model } from '../../utils/database/model';
import RecipeStepsModal from './RecipeStepsModal';

type Props = NativeStackScreenProps<RootStackParamList, 'Recipe'>;

export default function RecipeScreen({ navigation, route }: Props) {
  const { isAuthenticated } = useContext(AuthContext)
  const [recipe, setRecipe] = useState<Model<IRecipe> | null>(null)
  const [author, setAuthor] = useState<UserModel | null>(null)
  const [servings, setServings] = useState(0)
  const [showSteps, setShowSteps] = useState(false)

  useEffect(() => {
    RecipeModel.findById(route.params.id)
      .then((data) => {
        if (!data) {
          navigation.replace('NotFound')
          return
        }

        navigation.setOptions({
          title: data.title,
        })

        setRecipe(data)
        setServings(data.servings)

        UserModel.findById(data.author)
          .then((user) => setAuthor(user))
      })
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
          {author && (<>
            <Text style={styles.subtitle}>
              {' • Par '}
            </Text>
            <Text
              onPress={() => navigation.navigate('Profile', { id: author.id })}
              style={[styles.subtitle, { fontWeight: 'bold', textDecorationLine: 'underline' }]}
            >
              {author.name}
            </Text>
          </>)}
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
                  {step.title &&
                    <Text style={styles.stepTitle}>
                      {step.title}
                    </Text>}

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
    flex: 1,
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
