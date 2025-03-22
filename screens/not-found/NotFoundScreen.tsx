import { MaterialIcons } from '@expo/vector-icons';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = StaticScreenProps<undefined>

export default function NotFoundScreen({ }: Props) {
  const navigation = useNavigation()

  return (
    <View style={styles.container}>
      <Text
        style={{
          fontSize: 24,
          marginHorizontal: '15%',
          textTransform: 'uppercase',
        }}
      >
        — Erreur
      </Text>
      <Text
        style={{
          fontSize: 72,
          fontWeight: 'bold',
          marginHorizontal: '15%',
          marginTop: 8,
        }}
      >
        404 °C
      </Text>
      <Text
        style={{
          fontSize: 20,
          fontWeight: 'bold',
          marginHorizontal: '15%',
          marginTop: 30,
        }}
      >
        La page que vous cherchez n'existe pas ou a été déplacée !
      </Text>

      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: '15%',
          marginTop: 30,
        }}
      >
        <Text
          onPress={() => navigation.navigate('Home')}
          style={{ fontWeight: 'bold', textDecorationLine: 'underline' }}
        >
          Retour à la page d'accueil
        </Text>
        <MaterialIcons name="arrow-right-alt" size={24} color="black" />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
})
