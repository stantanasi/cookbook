import { NativeStackHeaderProps } from '@react-navigation/native-stack'
import React from 'react'
import { StyleSheet, TextInput, View } from 'react-native'

type Props = NativeStackHeaderProps

export default function Header({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        onSubmitEditing={({ nativeEvent }) => {
          navigation.navigate('Search', { query: nativeEvent.text })
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})