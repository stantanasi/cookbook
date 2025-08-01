import React, { useEffect, useState } from 'react';
import { TextInputProps, ViewStyle } from 'react-native';
import TextInput from './TextInput';

type Props = Omit<TextInputProps, 'value' | 'onChangeText'> & {
  label?: string;
  value?: number;
  onChangeValue?: (value: number) => void;
  decimal?: boolean;
  negative?: boolean;
  style?: ViewStyle;
};

export default function NumberInput({
  label,
  value,
  onChangeValue,
  decimal = true,
  negative = true,
  style,
  ...props
}: Props) {
  const [text, setText] = useState((value || undefined)?.toString() ?? '');

  useEffect(() => {
    if (+text !== value) {
      setText((value || undefined)?.toString() ?? '');
    }
  }, [value]);

  return (
    <TextInput
      label={label}
      {...props}
      inputMode="numeric"
      value={text}
      onChangeText={(text) => {
        const regex = decimal && negative
          ? /^-?\d*\.?\d*$/
          : decimal && !negative
            ? /^\d*\.?\d*$/
            : !decimal && negative
              ? /^-?\d*$/
              : /^\d*$/;

        if (regex.test(text)) {
          setText(text);

          const value = +text;
          if (!isNaN(value)) {
            onChangeValue?.(value);
          }
        }
      }}
      style={style}
    />
  );
}