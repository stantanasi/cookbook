import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

type Props = {}

export default function LoadingScreen({ }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator
        animating
        color="#000"
        size="large"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
