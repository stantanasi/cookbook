import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackHeaderProps, NativeStackNavigationProp } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { RootStackParamList } from '../navigation/types';

const LoginModal = ({ visible, onRequestClose }: {
  visible: boolean
  onRequestClose: () => void
}) => {
  const { login } = useContext(AuthContext)
  const [token, setToken] = useState('')
  const [isLogging, setIsLogging] = useState(false)
  const panY = useRef(new Animated.Value(Dimensions.get('screen').height)).current;

  const top = panY.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 0, 1],
  })

  useEffect(() => {
    if (visible) {
      Animated.timing(panY, {
        useNativeDriver: false,
        toValue: 0,
        duration: 300,
      }).start();
    } else {
      Animated.timing(panY, {
        useNativeDriver: false,
        toValue: Dimensions.get('screen').height,
        duration: 500,
      }).start()
    }
  }, [visible])

  return (
    <Modal
      animationType="fade"
      onRequestClose={() => onRequestClose()}
      transparent
      visible={visible}
    >
      <Pressable
        onPress={() => onRequestClose()}
        style={{
          backgroundColor: '#00000052',
          flex: 1,
          justifyContent: 'flex-end',
        }}
      >
        <Animated.View
          style={[{
            backgroundColor: '#fff',
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          }, { top }]}
        >
          <Pressable>
            <View
              style={{
                alignItems: 'center',
                borderBottomColor: '#ddd',
                borderBottomWidth: 1,
                flexDirection: 'row',
                padding: 16,
              }}
            >
              <Text
                style={{
                  flex: 1,
                  fontSize: 16,
                  fontWeight: 'bold',
                }}
              >
                Connexion
              </Text>
              <MaterialIcons
                name="close"
                size={24}
                color="#000"
                onPress={() => onRequestClose()}
              />
            </View>

            <Text
              style={{
                fontSize: 26,
                fontWeight: 'bold',
                paddingHorizontal: 16,
                marginTop: 16,
                textAlign: 'center',
              }}
            >
              Me connecter
            </Text>

            <TextInput
              value={token}
              onChangeText={(value) => setToken(value)}
              placeholder="GitHub API Token"
              placeholderTextColor="#a1a1a1"
              secureTextEntry
              style={{
                borderColor: '#EAEDE8',
                borderRadius: 4,
                borderWidth: 1,
                marginTop: 24,
                marginHorizontal: 20,
                paddingHorizontal: 6,
                paddingVertical: 8,
              }}
            />

            <View
              style={{
                alignItems: 'center',
                backgroundColor: '#000',
                borderRadius: 10,
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 12,
                marginHorizontal: 20,
                marginVertical: 24,
                padding: 16,
              }}
            >
              <Text
                onPress={async () => {
                  setIsLogging(true)

                  await login(token)

                  setIsLogging(false)
                  onRequestClose()
                }}
                style={{
                  color: '#fff',
                  fontWeight: 'bold',
                }}
              >
                Se connecter
              </Text>
              <ActivityIndicator
                animating={isLogging}
                color="#fff"
              />
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  )
}


type Props = NativeStackHeaderProps & {
  query: string
  onChangeQuery: (query: string) => void
}

export default function Header({ query, onChangeQuery, ...props }: Props) {
  const navigation = props.navigation as NativeStackNavigationProp<RootStackParamList>
  const { user } = useContext(AuthContext)
  const [isLoginModalVisible, setLoginModalVisible] = useState(false)

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
          value={query}
          onChangeText={(text) => onChangeQuery(text)}
          onSubmitEditing={() => {
            navigation.navigate('Search', { query: query })
          }}
          placeholder="Rechercher une recette"
          placeholderTextColor="#a1a1a1"
          style={styles.searchInput}
        />
      </View>

      <MaterialIcons
        name="person"
        size={24}
        color="#000"
        onPress={() => {
          if (user) {
            navigation.navigate('Profile', { id: user.id })
          } else {
            setLoginModalVisible(true)
          }
        }}
      />

      {!user && (
        <LoginModal
          visible={isLoginModalVisible}
          onRequestClose={() => setLoginModalVisible(false)}
        />
      )}
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