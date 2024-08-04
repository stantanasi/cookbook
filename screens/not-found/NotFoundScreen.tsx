import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react'
import { View } from 'react-native'
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'NotFound'>;

export default function NotFoundScreen({ }: Props) {
  return (
    <View>

    </View>
  )
}
