/* eslint-disable prettier/prettier */

import React, { useEffect } from 'react';
import Notification from './src/Notification';
import Screen from './src/Screen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack'
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import LoginScreen from './src/Screen/LoginScreen';
import { Provider } from 'react-native-paper';
import { theme } from './src/core/theme'
import CCPWebView from './src/Screen/CCPWebView';
import { config } from './src/config';

const App = () => {

  const Stack = createStackNavigator();

  useEffect(() => {

    (async () => {
      const settings = await notifee.getNotificationSettings();

      if (settings.authorizationStatus == AuthorizationStatus.AUTHORIZED) {
        console.log('Notification permissions has been authorized');
      } else if (settings.authorizationStatus == AuthorizationStatus.DENIED) {
        console.log('Notification permissions has been denied');
        await notifee.openNotificationSettings();
      }
    })();
  }, []);

  return (
    <>
      <Provider theme={theme}>
        <NavigationContainer>
          <Stack.Navigator >
            <Stack.Screen
              name="CCPWebView"
              // component={CCPWebView}
              // props={{uri:'http://172.16.53.80:3001/home'}}
              children={({ route, navigation }) => <CCPWebView uri={`${config.uri}/home`} route={route} navigation={navigation} name="Chat" />}
            />
            <Stack.Screen
              name="LoginScreen"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            {/* <Stack.Screen
              name="TabNavi"
              component={Screen}
              options={{ headerShown: false }}
            /> */}
          </Stack.Navigator>
          <Notification />
        </NavigationContainer>
      </Provider>
    </>
  );
};

export default App;
