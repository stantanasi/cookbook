import React, { useEffect, useState } from 'react'
import { TextInputProps, StyleProp, ViewStyle } from 'react-native'
import TextInput from './TextInput'

type Props = Omit<TextInputProps, 'value' | 'onChangeText'> & {
  label?: string
  value?: number
  onChangeValue?: (value: number) => void
  regex?: RegExp
  style?: StyleProp<ViewStyle>
}

export default function NumberInput({ label, value, onChangeValue, regex, style, ...props }: Props) {
  const [text, setText] = useState(value?.toString() ?? '')

  useEffect(() => {
    if (value && value !== +text) {
      setText(value.toString())
    }
  }, [value])

  return (
    <TextInput
      label={label}
      {...props}
      value={text}
      onChangeText={(text) => {
        text = text.replace(regex ?? /[^-0-9.]/g, '')

        if (!text) {
          onChangeValue?.(0)
        } else if (!isNaN(+text)) {
          onChangeValue?.(+text)
        }

        setText(text)
      }}
      onBlur={() => setText(value?.toString() ?? '')}
      style={style}
    />
  )
}