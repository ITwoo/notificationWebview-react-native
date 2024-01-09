import React from 'react'
import { Image, StyleSheet } from 'react-native'

export default function Logo() {
  return <Image source={require('../assets/korensEM_ci_small.png')} style={styles.image} />
}

const styles = StyleSheet.create({
  image: {
    width: '90%',
    height: '10%',
    marginBottom: 20,
    marginTop: '0%',
    objectFit: 'cover'
  },
})
