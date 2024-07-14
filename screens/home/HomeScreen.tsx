import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { recipes } from '../../data/recipes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import Recipe from '../../components/Recipe';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('Recipe', { id: item.id })}>
            <Recipe recipe={item} />
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
