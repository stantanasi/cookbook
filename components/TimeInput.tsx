import React, { useEffect, useState } from 'react'
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native'
import TextInput from './TextInput'
import TextInputLabel from './TextInputLabel'

type Props = {
  label?: string
  value: number
  onChangeValue: (value: number) => void
  style?: StyleProp<ViewStyle>
}

export default function TimeInput({ label, value, onChangeValue, style }: Props) {
  const [hours, setHours] = useState(Math.floor(value / 60))
  const [minutes, setMinutes] = useState(value % 60)

  useEffect(() => {
    setHours(Math.floor(value / 60))
    setMinutes(value % 60)
  }, [value])

  useEffect(() => {
    onChangeValue(hours * 60 + minutes)
  }, [hours, minutes])

  return (
    <View style={[styles.container, style]}>
      {label && (
        <TextInputLabel>
          {label}
        </TextInputLabel>
      )}

      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: 10,
        }}
      >
        <TextInput
          value={hours.toString()}
          onChangeText={(value) => setHours(+value.replace(/[^0-9]/g, ''))}
          placeholder="00"
          inputMode="numeric"
          textAlign="center"
          style={{ flex: 1 }}
        />
        <Text
          style={{
            color: '#888',
            fontSize: 16,
          }}
        >
          h
        </Text>
        <TextInput
          value={minutes.toString()}
          onChangeText={(value) => setMinutes(+value.replace(/[^0-9]/g, ''))}
          placeholder="00"
          inputMode="numeric"
          textAlign="center"
          style={{ flex: 1 }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {

  },
})