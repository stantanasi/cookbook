import React, { useState } from 'react';
import { StyleSheet, Text, TextInputProps, TextInput as TextInputRN, View, ViewStyle } from 'react-native';
import TextInputLabel from './TextInputLabel';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  style?: ViewStyle;
};

export default function TextInput({ label, error, style, ...props }: Props) {
  const [height, setHeight] = useState(0);

  return (
    <View style={[styles.container, style]}>
      {!!label && (
        <TextInputLabel>
          {label}
        </TextInputLabel>
      )}

      <TextInputRN
        placeholderTextColor="#a1a1a1"
        {...props}
        onContentSizeChange={(event) => {
          setHeight(event.nativeEvent.contentSize.height);
        }}
        style={[styles.input, { textAlign: props.textAlign }, { minHeight: Math.max(35, height + styles.input.borderWidth * 2) }]}
      />
      {error && (
        <Text
          style={{
            color: '#f00',
            fontSize: 10,
            fontStyle: 'italic',
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  input: {
    borderColor: '#EAEDE8',
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
});