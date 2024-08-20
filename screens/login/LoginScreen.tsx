import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useContext, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import TextInput from '../../components/TextInput';
import { AuthContext } from '../../contexts/AuthContext';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>

export default function LoginScreen({ }: Props) {
  const { login } = useContext(AuthContext)
  const [token, setToken] = useState('')

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

        <Text
          onPress={() => login(token)}
          style={styles.button}
        >
          Se connecter
        </Text>
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
    backgroundColor: '#000000',
    borderRadius: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 48,
    padding: 16,
    textAlign: 'center',
  },
})