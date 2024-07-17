import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React from 'react'
import { Text } from 'react-native'
import { RootStackParamList } from '../../navigation/types'

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeSave'>

export default function RecipeSaveScreen({ }: Props) {
  return (
    <Text>RecipeSaveScreen</Text>
  )
}