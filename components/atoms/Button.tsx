import React, { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, PressableProps, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type Props = PropsWithChildren<PressableProps & {
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}>;

export default function Button({
  children,
  loading = false,
  fullWidth = false,
  style,
  ...props
}: Props) {
  return (
    <Pressable
      disabled={loading}
      {...props}
      style={[styles.container, style, fullWidth ? { flex: 1 } : {}]}
    >
      <View style={{ opacity: loading ? 0 : 1 }}>
        {children}
      </View>

      <View
        style={[StyleSheet.absoluteFill, {
          alignItems: 'center',
          justifyContent: 'center',
        }]}
      >
        <ActivityIndicator
          animating={loading}
          color='#fff'
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 10,
    justifyContent: 'center',
    padding: 16,
  },
});
