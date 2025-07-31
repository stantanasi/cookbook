import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { toast } from 'sonner';
import TextInput from '../../components/atoms/TextInput';
import LoadingScreen from '../loading/LoadingScreen';
import NotFoundScreen from '../not-found/NotFoundScreen';
import { useCuisineSave } from './hooks/useCuisineSave';
import { useAppDispatch } from '../../redux/store';

type Props = StaticScreenProps<{
  id: string;
} | undefined>

export default function CuisineSaveScreen({ route }: Props) {
  const dispatch = useAppDispatch()
  const navigation = useNavigation();
  const { cuisine, form, setForm } = useCuisineSave(route.params);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!cuisine) {
      navigation.setOptions({
        title: 'Page non trouvée',
      });
      return
    }

    navigation.setOptions({
      title: cuisine.isNew
        ? 'Publier une nouvelle cuisine'
        : `${cuisine.name} - Éditer`,
    });
  }, [navigation, cuisine]);

  if (!form) {
    return <LoadingScreen />
  }
  if (!cuisine) {
    return <NotFoundScreen route={{ params: undefined }} />
  }

  const save = async () => {
    cuisine.assign(form);

    await cuisine.save(dispatch);

    if (navigation.canGoBack()) {
      navigation.goBack();
    } else if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>
          {cuisine.isNew ? 'Ajouter une nouvelle cuisine' : 'Modifier une cuisine'}
        </Text>

        <TextInput
          label="Cuisine"
          value={form.name}
          onChangeText={(value) => setForm((prev) => ({
            ...prev,
            name: value,
          }))}
          style={styles.input}
        />

        <View style={{ height: 16 }} />
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={() => {
            setIsSaving(true);

            save()
              .catch((err) => {
                console.error(err)
                toast.error("Échec de l'enregistrement de la cuisine", {
                  description: err.message || "Une erreur inattendue s'est produite",
                })
              })
              .finally(() => setIsSaving(false));
          }}
          style={styles.footerButton}
        >
          <Text style={styles.footerButtonText}>
            Enregistrer la cuisine
          </Text>
          <ActivityIndicator
            animating={isSaving}
            color='#FFFFFF'
          />
        </Pressable>
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
  input: {
    marginHorizontal: 16,
    marginTop: 16,
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
