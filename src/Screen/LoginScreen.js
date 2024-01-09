import React, { useCallback, useEffect, useState } from 'react'
import { TouchableOpacity, StyleSheet, View } from 'react-native'
import axios from 'axios'
import { jwtDecode } from "jwt-decode"

import AsyncStorage from "@react-native-async-storage/async-storage";

import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Button from '../components/Button'
import TextInput from '../components/TextInput'

// import BackButton from '../components/BackButton'
import { theme } from '../core/theme'

import { passwordValidator } from '../helpers/passwordValidator'
import { userIDValidator } from '../helpers/userIDValidator'

import { config } from '../config'
import { useFocusEffect } from '@react-navigation/native';
import { encrypt, decrypt } from '../lib/crypto';

import CookieManager from '@react-native-cookies/cookies';
import btoa from 'core-js-pure/stable/btoa';
import { pushToken } from '../Notification';

import Toast from 'react-native-toast-message';

const axiosApi = axios.create({
  baseURL: config.api_url,
  withCredentials: true,
});


export default function LoginScreen({ navigation }) {
  const [userId, setUserId] = useState({ value: '', error: '' })
  const [userPw, setUserPw] = useState({ value: '', error: '' })


  const onLoginPressed = async () => {
    const userIDError = userIDValidator(userId.value)
    const passwordError = passwordValidator(userPw.value)
    if (userIDError || passwordError) {
      setUserId({ ...userId, error: userIDError })
      setUserPw({ ...userPw, error: passwordError })
      return
    }
    
    try {

      let result = await axiosApi.post('/auth/login',
        { UserID: userId?.value, pwd: userPw?.value },
        {
          withCredentials: true,
          headers: {
            ["Content-Type"]: "application/json",
            ['site']: 'CCP',
            ['mobile']: true,
            ["client-id"]: 'kr.co.ccp',
          }
        }
      )
      
      if (result?.data?.data?.UserID) {
        if (result?.headers) {
          const refreshToken = result?.headers['refresh-token'];
          const accessToken = result?.headers['access-token'];
          let tokenData = jwtDecode(accessToken)
          await AsyncStorage.setItem(btoa("refresh-token"), btoa(refreshToken));
          await AsyncStorage.setItem(btoa("access-token"), btoa(accessToken));
          await AsyncStorage.setItem(btoa("user-idx"), btoa(tokenData?.idx?.toString()))
          await AsyncStorage.setItem(btoa("USERID"), encrypt(userId?.value));
          await AsyncStorage.setItem(btoa("USERPASSWORD"), encrypt(userPw?.value));
          await AsyncStorage.setItem("AUTOLOGINCHECK", 'true');
          
          // console.log(tokenData)
          await CookieManager.set(config.uri, {
            name: btoa("access-token"),
            value: btoa(accessToken),
            domain: config.baseDomain,
            // path: '/',
            // version: '1',
            // expires: new Date(date.setDate(date.getDate() + 10)).toUTCString(),
          })
        }

        await pushToken(userId?.value);

        navigation.reset({
          index: 0,
          routes: [{ name: 'CCPWebView' }],
        })
      }

    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Login',
        text2: 'ID 및 Password를 다시 입력 후 로그인해주시기 바랍니다.'
      });
      console.log(error)
    }
  }

  return (
    <>
      
      <Background>
        {/* <BackButton goBack={navigation.goBack} /> */}
        <Logo />
        <Header>Welcome, CCP.</Header>
        <TextInput
          label="UserID"
          returnKeyType="next"
          value={userId.value}
          onChangeText={(text) => setUserId({ value: text, error: '' })}
          error={!!userId.error}
          errorText={userId.error}
          autoCapitalize="none"
        // autoCompleteType="UserID"
        // keyboardType="UserID"
        />
        <TextInput
          label="Password"
          returnKeyType="done"
          value={userPw.value}
          onChangeText={(text) => setUserPw({ value: text, error: '' })}
          error={!!userPw.error}
          errorText={userPw.error}
          secureTextEntry
        />

        <Button style={styles.loginButton} mode="contained" onPress={onLoginPressed}>
          로그인
        </Button>
        <Toast />
      </Background>

    </>
  )
}

const styles = StyleSheet.create({
  forgotPassword: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgot: {
    fontSize: 13,
    color: theme.colors.secondary,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  loginButton: {
    marginTop: '10%',
    marginBottom: 0,
  }
})
