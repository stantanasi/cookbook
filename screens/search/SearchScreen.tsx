import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { RootStackParamList } from '../../navigation/types';
import RecipeApi from '../../utils/RecipeApi';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export default function SearchScreen({ route }: Props) {
  const query = route.params.query
  const recipes = RecipeApi.search(query)

  return (
    <View style={styles.container}>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})