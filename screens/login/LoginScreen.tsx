import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react'
import { RootStackParamList } from '../../navigation/types';
import { Text, View } from 'react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>

export default function LoginScreen({ }: Props) {
  return (
    <View>
      <Text>Login</Text>
    </View>
  )
}