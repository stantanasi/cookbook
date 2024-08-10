import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react'
import { Text, View } from 'react-native'
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export default function SearchScreen({}: Props) {
  return (
    <View>
      <Text>SearchScreen</Text>
    </View>
  )
}