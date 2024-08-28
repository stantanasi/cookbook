import React from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import TextInputLabel from './TextInputLabel'
import { Picker } from '@react-native-picker/picker'

type Props<T> = {
  label?: string
  selectedValue?: T
  onValueChange?: (itemValue: T, itemIndex: number) => void
  values?: {
    key?: string
    label?: string
    value?: T
  }[]
  style?: StyleProp<ViewStyle>
}

export default function SelectInput<T>({ label, selectedValue, onValueChange, values, style }: Props<T>) {
  return (
    <View style={[styles.container, style]}>
      {!!label && (
        <TextInputLabel>
          {label}
        </TextInputLabel>
      )}

      <Picker
        selectedValue={selectedValue}
        onValueChange={(value, index) => {
          if (value) {
            return onValueChange?.(value, index)
          }
        }}
        mode="dropdown"
        style={styles.input}
      >
        <Picker.Item
          label="Sélectionner"
          value=""
        />
        {values?.map((value) => (
          <Picker.Item
            key={value.key}
            label={value.label}
            value={value.value}
          />
        ))}
      </Picker>
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
