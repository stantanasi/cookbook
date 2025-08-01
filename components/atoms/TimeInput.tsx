import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import NumberInput from './NumberInput';
import TextInputLabel from './TextInputLabel';


type Props = {
  label?: string;
  value: number;
  onChangeValue: (value: number) => void;
  style?: ViewStyle;
};

export default function TimeInput({ label, value, onChangeValue, style }: Props) {
  const [hours, setHours] = useState(Math.floor(value / 60));
  const [minutes, setMinutes] = useState(value % 60);

  useEffect(() => {
    setHours(Math.floor(value / 60));
    setMinutes(value % 60);
  }, [value]);

  useEffect(() => {
    onChangeValue(hours * 60 + minutes);
  }, [hours, minutes]);

  return (
    <View style={[styles.container, style]}>
      {!!label && (
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
        <NumberInput
          value={hours}
          onChangeValue={(value) => setHours(value)}
          placeholder="00"
          inputMode="numeric"
          decimal={false}
          negative={false}
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
        <NumberInput
          value={minutes}
          onChangeValue={(value) => setMinutes(value)}
          placeholder="00"
          inputMode="numeric"
          decimal={false}
          negative={false}
          textAlign="center"
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {

  },
});