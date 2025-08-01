import { MaterialIcons } from '@expo/vector-icons';
import { StackActions, StaticScreenProps, useNavigation } from '@react-navigation/native';
import { launchImageLibraryAsync } from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import slugify from 'slugify';
import { toast } from 'sonner';
import AutoHeightImage from '../../components/atoms/AutoHeightImage';
import NumberInput from '../../components/atoms/NumberInput';
import SelectInput from '../../components/atoms/SelectInput';
import TextInput from '../../components/atoms/TextInput';
import TimeInput from '../../components/atoms/TimeInput';
import { IRecipe } from '../../models/recipe.model';
import { useAppDispatch } from '../../redux/store';
import { ModelValidationError } from '../../utils/database';
import { isEmpty } from '../../utils/utils';
import LoadingScreen from '../loading/LoadingScreen';
import NotFoundScreen from '../not-found/NotFoundScreen';
import StepInput from './components/StepInput';
import { useRecipeSave } from './hooks/useRecipeSave';

type Props = StaticScreenProps<{
  id: string;
} | undefined>;

export default function RecipeSaveScreen({ route }: Props) {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { categories, cuisines, recipe, form, setForm } = useRecipeSave(route.params);
  const [errors, setErrors] = useState<ModelValidationError<IRecipe>>({});
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);

  useEffect(() => {
    if (!recipe) {
      navigation.setOptions({
        title: 'Page non trouvée',
      });
      return;
    }

    if (!recipe.isNew && route.params?.id !== `${recipe.id}-${slugify(recipe.title, { lower: true })}`) {
      navigation.setParams({
        id: `${recipe.id}-${slugify(recipe.title, { lower: true })}`,
      });
    }

    navigation.setOptions({
      title: recipe.isNew
        ? 'Publier une nouvelle recette'
        : `${recipe.title} - Éditer`,
    });
  }, [navigation, recipe]);

  if (!form) {
    return <LoadingScreen />;
  }
  if (!recipe) {
    return <NotFoundScreen route={{ params: undefined }} />;
  }

  const save = async (options?: { asDraft: boolean; }) => {
    recipe.assign(form);

    const errors = recipe.validate() ?? {};
    setErrors(errors);
    if (!isEmpty(errors)) {
      return;
    }

    await recipe.save(dispatch, options);

    if (!options?.asDraft) {
      navigation.dispatch(
        StackActions.replace('Recipe', { id: recipe.id })
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>
          {recipe.isNew ? 'Ajouter une nouvelle recette' : 'Modifier une recette'}
        </Text>

        <Pressable
          onPress={() => {
            launchImageLibraryAsync({
              mediaTypes: 'images',
              quality: 1,
            })
              .then((result) => {
                if (!result.canceled) {
                  setForm((prev) => ({
                    ...prev,
                    image: result.assets[0].uri,
                  }));
                }
              })
              .catch((err) => console.error(err));
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
              if (index == 0) return;
              setForm((prev) => ({
                ...prev,
                steps: prev.steps.toSpliced(index, 1).toSpliced(index - 1, 0, step),
              }));
            }}
            onMoveStepDown={() => {
              if (index >= form.steps.length - 1) return;
              setForm((prev) => ({
                ...prev,
                steps: prev.steps.toSpliced(index, 1).toSpliced(index + 1, 0, step),
              }));
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
          onPress={() => {
            setIsSaving(true);

            save()
              .catch((err) => {
                console.error(err);
                toast.error("Échec de l'enregistrement de la recette", {
                  description: err.message || "Une erreur inattendue s'est produite",
                });
              })
              .finally(() => setIsSaving(false));
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
            <Pressable
              onPress={() => {
                setIsDraftSaving(true);

                save({ asDraft: true })
                  .then(() => setMoreOptionsOpen(false))
                  .catch((err) => {
                    console.error(err);
                    toast.error("Échec de l'enregistrement de la recette", {
                      description: err.message || "Une erreur inattendue s'est produite",
                    });
                  })
                  .finally(() => setIsDraftSaving(false));
              }}
              style={{
                backgroundColor: '#fff',
                elevation: 5,
                flexDirection: 'row',
                gap: 12,
                margin: 16,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 1, height: 1 },
                shadowOpacity: 0.4,
                shadowRadius: 3,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                }}
              >
                Enregistrer en tant que brouillon
              </Text>
              <ActivityIndicator
                animating={isDraftSaving}
                color='#000000'
              />
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </View>
  );
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
});