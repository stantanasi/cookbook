import { NativeStackHeaderProps } from '@react-navigation/native-stack'
import React from 'react'
import { Text, View } from 'react-native'

type Props = NativeStackHeaderProps

export default function Header({ navigation }: Props) {
  return (
    <View>
      <Text>Header</Text>
    </View>
  )
}