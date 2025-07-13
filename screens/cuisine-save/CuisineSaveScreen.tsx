import { StaticScreenProps } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

type Props = StaticScreenProps<{
  id: string;
} | undefined>

export default function CuisineSaveScreen({ }: Props) {
  return (
    <View style={styles.container}>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
});
