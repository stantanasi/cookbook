import React from 'react'
import { StyleProp, StyleSheet, Text, TextInputProps, TextInput as TextInputRN, View, ViewStyle } from 'react-native'
import TextInputLabel from './TextInputLabel'

type Props = TextInputProps & {
  label?: string
  style?: StyleProp<ViewStyle>
}

export default function TextInput({ label, style, ...props }: Props) {
  return (
    <View style={[styles.container, style]}>
      {label && (
        <TextInputLabel>
          {label}
        </TextInputLabel>
      )}

      <TextInputRN
        {...props}
        style={[styles.input, { textAlign: props.textAlign }]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {},
  input: {
    borderColor: '#EAEDE8',
    borderRadius: 4,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
})