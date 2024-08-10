import { NativeStackHeaderProps, NativeStackNavigationProp } from '@react-navigation/native-stack'
import React from 'react'
import { StyleSheet, TextInput, View } from 'react-native'
import { RootStackParamList } from '../navigation/types'

type Props = NativeStackHeaderProps & {
  query?: string
}

export default function Header({ query, ...props }: Props) {
  const navigation = props.navigation as NativeStackNavigationProp<RootStackParamList>

  return (
    <View style={styles.container}>
      <TextInput
        defaultValue={query}
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