import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

export default function TextInputLabel({ style, ...props }: TextProps) {
  return (
    <Text
      {...props}
      style={[styles.label, style]}
    />
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
  },
});