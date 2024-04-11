import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { recipes } from '../../data/recipes';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View>
            <Text>{item.title}</Text>
            <Image source={item.image} />
          </View>
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
