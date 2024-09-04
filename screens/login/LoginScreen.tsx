import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useContext, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import TextInput from '../../components/TextInput';
import { AuthContext } from '../../contexts/AuthContext';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>

export default function LoginScreen({ }: Props) {
  const { login } = useContext(AuthContext)
  const [token, setToken] = useState('')

  const [isLogging, setIsLogging] = useState(false)

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>
          Connexion
        </Text>

        <TextInput
          label="GitHub API Token"
          value={token}
          onChangeText={(value) => setToken(value)}
          secureTextEntry
          style={styles.input}
        />

        <View style={styles.button}>
          <Text
            onPress={async () => {
              setIsLogging(true)

              await login(token)

              setIsLogging(false)
            }}
            style={styles.buttonText}
          >
            Se connecter
          </Text>
          <ActivityIndicator
            animating={isLogging}
            color="#fff"
          />
        </View>
      </ScrollView>
    </View >
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 32,
    marginTop: 16,
    textAlign: 'center',
  },
  input: {
    marginHorizontal: 16,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 48,
    padding: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
})