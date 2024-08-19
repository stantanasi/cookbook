import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import StepAction from './StepAction'
import { IStep } from '../models/recipe.model'

type Props = {
  step: IStep
}

export default function Step({ step }: Props) {
  return (
    <View style={styles.container}>
      {step.title &&
        <Text style={styles.title}>{step.title}</Text>}

      <View style={styles.actions}>
        {step.actions.map((action, index) => (
          <StepAction
            key={index}
            action={action}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    fontSize: 20,
    textTransform: 'uppercase',
  },
  actions: {
    marginTop: 10,
  },
})