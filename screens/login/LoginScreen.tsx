import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react'
import { RootStackParamList } from '../../navigation/types';
import { Button, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>

export default function LoginScreen({ navigation }: Props) {
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
        onPress={async () => {
          await AsyncStorage.setItem("github_token", token)
          navigation.navigate('Home')
        }}
      />
    </View>
  )
}