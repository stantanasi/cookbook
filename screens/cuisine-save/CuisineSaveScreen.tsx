import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { toast } from 'sonner';
import TextInput from '../../components/atoms/TextInput';
import Cuisine, { ICuisine } from '../../models/cuisine.model';
import LoadingScreen from '../loading/LoadingScreen';
import NotFoundScreen from '../not-found/NotFoundScreen';

type Props = StaticScreenProps<{
  id: string;
} | undefined>

export default function CuisineSaveScreen({ route }: Props) {
  const navigation = useNavigation();
  const [cuisine, setCuisine] = useState<Cuisine | null>();
  const [form, setForm] = useState<Partial<ICuisine>>();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchCuisine = async () => {
      setIsLoading(true);

      const cuisine = await (() => {
        if (!route.params) {
          return new Cuisine({});
        }

        return Cuisine.findById(route.params.id);
      })();

      if (!cuisine) {
        navigation.setOptions({
          title: 'Page non trouvée',
        });

        setCuisine(null);
        setForm(null as any);
        setIsLoading(false);
        return
      }

      navigation.setOptions({
        title: cuisine.isNew
          ? 'Publier une nouvelle cuisine'
          : `${cuisine.name} - Éditer`,
      });

      setCuisine(cuisine);
      setForm(cuisine.toObject());
      setIsLoading(false);
    };

    fetchCuisine();
  }, [navigation, route]);

  if (isLoading || cuisine === undefined || form === undefined) {
    return <LoadingScreen />
  }
  if (cuisine === null || form === null) {
    return <NotFoundScreen route={{ params: undefined }} />
  }

  const save = async () => {
    cuisine.assign(form);

    await cuisine.save();

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
          onPress={async () => {
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
