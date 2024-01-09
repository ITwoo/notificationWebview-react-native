/* eslint-disable prettier/prettier */
/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import { onMessageReceived } from './src/Notification';
import notifee, { EventType } from '@notifee/react-native';

import atob from 'core-js-pure/stable/atob';
import btoa from 'core-js-pure/stable/btoa';
global.atob = atob
global.btoa = btoa

notifee.onBackgroundEvent(async ({ type, detail }) => {
    // console.log(type, detail)
    console.log('bevent')
    if (type === EventType.PRESS) {
        console.log('User pressed the notification.', detail.pressAction.id);
    }

})

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    // console.log('Message handled in the background!', remoteMessage);
    try {
        await onMessageReceived(remoteMessage);
    } catch (err) {
        console.log(err);
    }

});

function HeadlessCheck({ isHeadless }) {

    if (isHeadless) {
        // App has been launched in the background by iOS, ignore
        return null;
    }

    return <App />;
}
AppRegistry.registerComponent(appName, () => HeadlessCheck);

// AppRegistry.registerComponent(appName, () => App);
