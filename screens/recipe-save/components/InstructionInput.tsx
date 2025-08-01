import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import TextInput from '../../../components/atoms/TextInput';
import { IInstruction } from '../../../models/recipe.model';

type Props = {
  number: number;
  instruction: IInstruction;
  onInstructionChange: (instruction: IInstruction) => void;
  onInstructionDelete: () => void;
  onMoveInstructionUp: () => void;
  onMoveInstructionDown: () => void;
};

export default function InstructionInput({
  number,
  instruction,
  onInstructionChange,
  onInstructionDelete,
  onMoveInstructionUp,
  onMoveInstructionDown,
}: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        label={`Instruction ${number}`}
        value={instruction.description}
        onChangeText={(value) => onInstructionChange({
          ...instruction,
          description: value,
        })}
        multiline
        style={{ flex: 1 }}
      />

      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: 4,
        }}
      >
        <View style={{ gap: 14 }}>
          <MaterialIcons
            name="arrow-circle-up"
            size={24}
            color="#888"
            onPress={() => onMoveInstructionUp()}
          />
          <MaterialIcons
            name="arrow-circle-down"
            size={24}
            color="#888"
            onPress={() => onMoveInstructionDown()}
          />
        </View>

        <MaterialIcons
          name="remove-circle-outline"
          size={24}
          color="#000"
          onPress={() => onInstructionDelete()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    marginLeft: 32,
    marginRight: 16,
    marginTop: 16,
  },
});