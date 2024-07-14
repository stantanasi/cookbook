import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { recipes } from '../../data/recipes';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Recipe'>;

export default function RecipeScreen({ navigation, route }: Props) {
  const recipe = recipes.find((recipe) => recipe.id === route.params.id)

  if (!recipe) {
    navigation.goBack()
    return null
  }

  return (
    <View style={styles.container}>
      <Text>{recipe.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
