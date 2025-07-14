import { StackActions, StaticScreenProps, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import TextInput from '../../components/atoms/TextInput';
import Cuisine, { ICuisine } from '../../models/cuisine.model';

type Props = StaticScreenProps<{
  id: string;
} | undefined>

export default function CuisineSaveScreen({ route }: Props) {
  const navigation = useNavigation();
  const [cuisine, setCuisine] = useState<Cuisine>();
  const [form, setForm] = useState<Partial<ICuisine>>();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCuisine = async () => {
      setIsLoading(true);

      let cuisine = new Cuisine({});
      if (route.params) {
        const result = await Cuisine.findById(route.params.id);

        if (!result) {
          navigation.dispatch(
            StackActions.replace('NotFound')
          );
          return
        }

        cuisine = result;
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

  if (isLoading || !cuisine || !form) {
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
    );
  }

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
});
