import { NativeStackHeaderProps, NativeStackNavigationProp } from '@react-navigation/native-stack'
import React from 'react'
import { Image, Pressable, StyleSheet, TextInput, View } from 'react-native'
import { RootStackParamList } from '../navigation/types'

type Props = NativeStackHeaderProps & {
  query?: string
}

export default function Header({ query, ...props }: Props) {
  const navigation = props.navigation as NativeStackNavigationProp<RootStackParamList>

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => navigation.navigate('Home')}
      >
        <Image
          style={styles.icon}
          source={require('../assets/icon.png')}
        />
      </Pressable>
      <TextInput
        defaultValue={query}
        onSubmitEditing={({ nativeEvent }) => {
          navigation.navigate('Search', { query: nativeEvent.text })
        }}
      />
      <Pressable
        onPress={() => navigation.navigate('Login')}
      >
        <Image
          style={styles.icon}
          source={require('../assets/icon.png')}
        />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  icon: {
    height: 32,
    width: 32,
  },
})