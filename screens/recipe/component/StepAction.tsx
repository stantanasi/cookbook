import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

type Props = {
  action: string
}

export default function StepAction({ action }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.bulletPoint}>• </Text>
      <Text style={styles.value}>{action}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  bulletPoint: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 15,
  },
})