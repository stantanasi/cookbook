import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

type Props = {
  visible: boolean
  onRequestClose: () => void
}

export default function LoginModal({ visible, onRequestClose }: Props) {
  const { login } = useAuth()
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
                    .then(() => onRequestClose())
                    .catch((err) => console.error(err))
                    .finally(() => setIsLogging(false))
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
};