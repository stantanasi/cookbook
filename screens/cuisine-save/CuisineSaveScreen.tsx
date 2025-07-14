import { StackActions, StaticScreenProps, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Cuisine, { ICuisine } from '../../models/cuisine.model';

type Props = StaticScreenProps<{
  id: string;
} | undefined>

export default function CuisineSaveScreen({ route }: Props) {
  const navigation = useNavigation();
  const [cuisine, setCuisine] = useState<Cuisine>();
  const [form, setForm] = useState<Partial<ICuisine>>();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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

  return (
    <View style={styles.container}>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
});
