import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useContext } from 'react'
import { Button, Text, View } from 'react-native'
import { RootStackParamList } from '../../navigation/types'
import { AuthContext } from '../../contexts/AuthContext'

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>

export default function ProfileScreen({ }: Props) {
  const { user, logout } = useContext(AuthContext)

  if (!user) {
    return <View></View>
  }

  return (
    <View>
      <Text>
        {user.name ?? user.pseudo}
      </Text>
      <Text>
        @{user.pseudo}
      </Text>

      <Text>
        {user.bio}
      </Text>

      <Button
        title='Logout'
        onPress={() => logout()}
      />
    </View>
  )
}