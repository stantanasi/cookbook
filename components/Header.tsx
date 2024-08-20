import { NativeStackHeaderProps, NativeStackNavigationProp } from '@react-navigation/native-stack'
import Constants from 'expo-constants';
import React, { useContext } from 'react'
import { Image, Pressable, StyleSheet, TextInput, View } from 'react-native'
import { RootStackParamList } from '../navigation/types'
import { MaterialIcons } from '@expo/vector-icons'
import { AuthContext } from '../contexts/AuthContext'

type Props = NativeStackHeaderProps & {
  query?: string
}

export default function Header({ query, ...props }: Props) {
  const navigation = props.navigation as NativeStackNavigationProp<RootStackParamList>
  const { isAuthenticated } = useContext(AuthContext)

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => navigation.navigate('Home')}
      >
        <Image
          style={styles.logo}
          source={require('../assets/icon.png')}
        />
      </Pressable>

      <View style={styles.search}>
        <MaterialIcons name="search" size={20} color="#000" />
        <TextInput
          defaultValue={query}
          onSubmitEditing={({ nativeEvent }) => {
            navigation.navigate('Search', { query: nativeEvent.text })
          }}
          placeholder='Rechercher une recette'
          style={styles.searchInput}
        />
      </View>

      <MaterialIcons
        name="person"
        size={24}
        color="#000"
        onPress={() => {
          if (isAuthenticated) {
            navigation.navigate('Profile')
          } else {
            navigation.navigate('Login')
          }
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 5,
    flexDirection: 'row',
    gap: 16,
    paddingBottom: 8,
    paddingHorizontal: 16,
    paddingTop: Constants.statusBarHeight + 8,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  logo: {
    height: 32,
    width: 32,
  },
  search: {
    alignItems: 'center',
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 8,
  },
  searchInput: {
    flex: 1,
  },
})