import React from 'react'
import { StyleSheet, KeyboardAvoidingView, View } from 'react-native'
import { theme } from '../core/theme'
import { Text } from 'react-native-paper'

export default function Background({ children }) {
  return (
    <View
      // source={require('../assets/background_dot.png')}
      resizeMode="repeat"
      style={styles.background}
    >
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        {children}
      </KeyboardAvoidingView>
      <Text style={styles.text}>Copyright(C) 2024 KORENSEM. ALL Rights Reserved </Text>


    </View>
  )
}

const styles = StyleSheet.create({
  background: {
    width: '100%',
    backgroundColor: '#f4f4f4',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    // backgroundColor: theme.colors.surface,\
  },
  container: {
    zIndex: -1,
    padding: '10%',
    margin: '10%',
    top: '10%',
    height: '60%',
    width: '90%',
    maxWidth: 500,
    minHeight: 500,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  text: {
    zIndex: 1000,
    margin: '10%',
    color: '#6c757d',
    fontSize: 11
  }
})

