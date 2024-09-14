import { MaterialIcons } from '@expo/vector-icons'
import React, { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { Animated, Pressable, Text, View, ViewStyle } from 'react-native'

type Props = PropsWithChildren<{
  title: string
  style?: ViewStyle
}>

export default function Collapsible({ title, style, children }: Props) {
  const [isCollapsed, setCollapsed] = useState(true)
  const [childrenHeight, setChildrenHeight] = useState(0)
  const animation = useRef(new Animated.Value(0)).current

  const height = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })

  useEffect(() => {
    if (isCollapsed) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start()
    } else {
      Animated.timing(animation, {
        toValue: childrenHeight,
        duration: 300,
        useNativeDriver: false,
      }).start()
    }
  }, [isCollapsed])

  return (
    <View style={style}>
      <Pressable
        onPress={() => setCollapsed((prev) => !prev)}
        style={{
          alignItems: 'center',
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
          {title}
        </Text>
        <MaterialIcons
          name={isCollapsed ? 'keyboard-arrow-down' : 'keyboard-arrow-up'}
          size={24}
          color="black"
        />
      </Pressable>
      <Animated.View style={{ height: height, overflow: 'hidden' }}>
        <View
          onLayout={(event) => {
            const onLayoutHeight = event.nativeEvent.layout.height;
            if (onLayoutHeight > 0 && childrenHeight !== onLayoutHeight) {
              setChildrenHeight(onLayoutHeight)
            }
          }}
        >
          {children}
        </View>
      </Animated.View>
    </View>
  )
}