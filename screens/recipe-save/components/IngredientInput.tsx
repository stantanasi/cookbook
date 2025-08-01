import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import NumberInput from '../../../components/atoms/NumberInput';
import TextInput from '../../../components/atoms/TextInput';
import { IIngredient } from '../../../models/recipe.model';

type Props = {
  ingredient: IIngredient;
  onIngredientChange: (ingredient: IIngredient) => void;
  onIngredientDelete: () => void;
  onMoveIngredientUp: () => void;
  onMoveIngredientDown: () => void;
};

export default function IngredientInput({
  ingredient,
  onIngredientChange,
  onIngredientDelete,
  onMoveIngredientUp,
  onMoveIngredientDown,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <TextInput
          label="Ingrédient"
          value={ingredient.name}
          onChangeText={(value) => onIngredientChange({
            ...ingredient,
            name: value,
          })}
        />

        <View
          style={{
            flexDirection: 'row',
            gap: 14,
            marginTop: 4,
          }}
        >
          <NumberInput
            label="Quantité"
            value={ingredient.quantity}
            onChangeValue={(value) => onIngredientChange({
              ...ingredient,
              quantity: value,
            })}
            inputMode="decimal"
            decimal
            negative={false}
            style={{ flex: 1 }}
          />

          <TextInput
            label="Mesure"
            value={ingredient.unit}
            onChangeText={(value) => onIngredientChange({
              ...ingredient,
              unit: value,
            })}
            autoCapitalize="none"
            style={{ flex: 1 }}
          />
        </View>
      </View>

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
            onPress={() => onMoveIngredientUp()}
          />
          <MaterialIcons
            name="arrow-circle-down"
            size={24}
            color="#888"
            onPress={() => onMoveIngredientDown()}
          />
        </View>

        <MaterialIcons
          name="remove-circle-outline"
          size={24}
          color="#000"
          onPress={() => onIngredientDelete()}
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