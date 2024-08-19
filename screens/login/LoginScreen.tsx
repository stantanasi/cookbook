import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useContext, useState } from 'react'
import { RootStackParamList } from '../../navigation/types';
import { Button, Text, TextInput, View } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>

export default function LoginScreen({ navigation }: Props) {
  const { login } = useContext(AuthContext)
  const [token, setToken] = useState('')

  return (
    <View>
      <Text>Login</Text>
      <TextInput
        value={token}
        onChangeText={(value) => setToken(value)}
        placeholder='GitHub API Token'
        secureTextEntry
      />
      <Button
        title='Login'
        onPress={() => {
          login(token)
            .then(() => navigation.navigate('Home'))
        }}
      />
    </View>
  )
}