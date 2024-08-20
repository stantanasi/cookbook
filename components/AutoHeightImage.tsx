import React, { useState } from 'react'
import { Image, ImageProps, Platform } from 'react-native'

export default function AutoHeightImage(props: ImageProps) {
  const [width, setWidth] = useState(1)
  const [height, setHeight] = useState(1)

  if (props.source) {
    let uri = ''
    if (Array.isArray(props.source)) {
      uri = props.source[props.source.length - 1].uri ?? ''
    } else if (typeof props.source === 'number') {
      if (Platform.OS === "web") {
        uri = props.source.toString()
      } else {
        uri = Image.resolveAssetSource(props.source).uri
      }
    } else {
      uri = props.source.uri ?? ''
    }

    Image.getSize(uri, (width, height) => {
      setWidth(width)
      setHeight(height)
    })
  }

  return (
    <Image
      {...props}
      style={[props.style, { aspectRatio: width / height }]}
    />
  )
}