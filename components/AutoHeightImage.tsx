import React, { useState } from 'react'
import { ImageProps, Image } from 'react-native'

export default function AutoHeightImage(props: ImageProps) {
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  if (props.source) {
    let uri = ''
    if (Array.isArray(props.source)) {
      uri = props.source[props.source.length - 1].uri ?? ''
    } else if (typeof props.source === 'number') {
      uri = Image.resolveAssetSource(props.source).uri
    } else {
      uri = props.source.uri ?? ''
    }

    Image.getSize((props.source as any)?.uri, (width, height) => {
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