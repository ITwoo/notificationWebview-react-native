/* eslint-disable prettier/prettier */
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import React, { useEffect } from 'react';
import notifee, { AndroidLaunchActivityFlag, AndroidStyle, AuthorizationStatus, EventType } from '@notifee/react-native';
import md5 from 'md5';
import { Text, View } from 'react-native';
import CCPWebView from './Screen/CCPWebView';
import { useNavigation } from '@react-navigation/native';
import { AppRegistry } from 'react-native';
import { config } from './config';
import btoa from 'core-js-pure/stable/btoa';
import { decrypt } from './lib/crypto';
import atob from 'core-js-pure/stable/atob';
import AsyncStorage from '@react-native-async-storage/async-storage';
export const deleteToken = async () => {
    try {
        let userId = decrypt(await AsyncStorage.getItem(btoa('USERID')));
        let fcmToken = atob(await AsyncStorage.getItem(btoa('fcmToken')));

        if (fcmToken && userId) {
            let login = await axios.post(`${config.chat_uri}/api/v1/login`, {
                user: userId,
                password: md5(userId)
            }, {
                headers: {
                    "Content-Type": "application/json"
                }
            })

            const data = login?.data?.data;


            let result = await axios.delete(`${config.chat_uri}/api/v1/push.token`,
                {
                    data: {
                        token: fcmToken
                    },
                    headers: {
                        'X-Auth-Token': data?.authToken,
                        'X-User-Id': data?.userId,
                        // 'X-Auth-Token': 'X4JSBD-im2nP_nmp8UW-zsaew7FSxhD-IP4W2jZbOPG',
                        // 'X-User-Id': 'FmXZtkDs4dDg9EM92',
                        'Content-Type': 'application/json',
                    },
                });
        }
        await AsyncStorage.setItem(btoa("fcmToken"), btoa(''))
    } catch (err) {
        console.log(err)
    }
}

export const pushToken = async (username) => {
    try {

        const authStatus = await messaging().requestPermission();
        // console.log(authStatus)
        const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        // console.log(enabled)
        if (enabled) {

            const fcmToken = await messaging().getToken({ appappName: config.appName });
            // console.log(fcmToken)
            if (username) {

                let login = await axios.post(`${config.chat_uri}/api/v1/login`, {
                    user: username,
                    password: md5(username)
                }, {
                    headers: {
                        "Content-Type": "application/json"
                    }
                })

                const data = login?.data?.data;

                //rocket chat auth token
                if (fcmToken && data?.authToken) {

                    // console.log(data)
                    let result = await axios.post(`${config.chat_uri}/api/v1/push.token`, {
                        type: 'gcm',
                        value: fcmToken,
                        appName: 'com.notithree',
                    },
                        {
                            headers: {
                                'X-Auth-Token': data?.authToken,
                                'X-User-Id': data?.userId,
                                // 'X-Auth-Token': 'X4JSBD-im2nP_nmp8UW-zsaew7FSxhD-IP4W2jZbOPG',
                                // 'X-User-Id': 'FmXZtkDs4dDg9EM92',
                                'Content-Type': 'application/json',
                            },
                        });

                    await AsyncStorage.setItem(btoa("fcmToken"), btoa(fcmToken));
                }
            }
            // console.log(result?.status)
            // console.log('success');
        }
    } catch (err) {
        console.log(err);
    }
}

export async function onMessageReceived(messages) {
    try {

        const { username, image, message, title, ejson } = messages.data;
        // console.log('display')
        // console.log(messages)
        // console.log(ejson && JSON.parse(ejson))
        await notifee.requestPermission()

        const data = ejson && JSON.parse(ejson);

        const channelId = await notifee.createChannel({
            id: 'default',
            name: 'Default Channel',
        });
        const android = {
            channelId,
            smallIcon: 'ic_notifications',
            largeIcon: image ? image : null,
            style: { type: AndroidStyle.BIGPICTURE, picture: image ? image : null },
            color: 'black',
            pressAction: {
                id: 'default',
                launchActivity: 'default',
                launchActivityFlags: [AndroidLaunchActivityFlag.SINGLE_TOP],
            },
        }
        await notifee.displayNotification({
            title: title,
            body: message,
            data: data,
            android:
            // android
            {
                channelId,
                smallIcon: 'ic_notifications',
                // largeIcon: image,
                // style: { type: AndroidStyle.BIGPICTURE, picture: image },
                color: 'black',
                pressAction: {
                    id: 'default',
                    launchActivity: 'default',
                    launchActivityFlags: [AndroidLaunchActivityFlag.SINGLE_TOP],
                },
            },
        });
    } catch (err) {
        console.log(err);
    }
}

const Notification = () => {

    const navigation = useNavigation();

    async function bootstrap() {
        const initialNotification = await notifee.getInitialNotification();
        // console.log('aaa')
        if (initialNotification) {
            console.log('Notification caused application to open', initialNotification.notification);
            console.log('Press action used to open the app', initialNotification);
            if (initialNotification.notification) {
                const data = initialNotification.notification?.data;
                const { type, host, rid } = data;

                if (type === 'd') {
                    navigation.navigate("CCPWebView", {
                        priorityUri: `${config.uri}/chat_mobile/direct`,
                        rid: rid,
                        type: type
                    });
                }

                if (type === 'p') {
                    navigation.navigate("CCPWebView", {
                        priorityUri: `${config.uri}/chat_mobile/group`,
                        rid: rid,
                        type: type
                    });
                }
            }

        }
    }



    // useEffect(() => {
    //     (async () => {
    //         await pushToken();
    //         console.log('login')
    //     })();
    // }, [])

    // const pushToken = async (deviceToken) => {
    //     try {
    //         const username = 'aaaa';
    //         let login = await axios.post('http://172.16.53.80:3000/api/v1/login', {
    //             user: username,
    //             password: 'aaaa'
    //             // password: md5(username)
    //         }, {
    //             headers: {
    //                 "Content-Type": "application/json"
    //             }
    //         })
    //         // console.log(login)
    //         // console.log(login?.data?.data)

    //         const data = login?.data?.data;

    //         let result = await axios.post('http://172.16.53.80:3000/api/v1/push.token', {
    //             type: 'gcm',
    //             value: deviceToken,
    //             appName: 'com.notithree',
    //         },
    //             {
    //                 headers: {
    //                     'X-Auth-Token': data?.authToken,
    //                     'X-User-Id': data?.userId,
    //                     'Content-Type': 'application/json',
    //                 },
    //             });
    //         console.log(result?.status)
    //         console.log('success');
    //     } catch (err) {
    //         console.log(err);
    //     }
    // };

    // const getToken = async () => {
    //     try {
    //         const fcmToken = await messaging().getToken();
    //         console.log('디바이스 토큰값');
    //         console.log(fcmToken);
    //         pushToken(fcmToken);
    //     } catch (err) {
    //         console.log(err);
    //     }
    //     // dispatch(set_deviceToken(fcmToken));
    // };

    // const requestUserPermission = async () => {
    //     try {

    //         const authStatus = await messaging().requestPermission();
    //         console.log(authStatus)
    //         const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    //             authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    //         if (enabled) {
    //             return getToken();
    //         }
    //     } catch (err) {
    //         console.log(err);
    //     }
    // };


    // useEffect(() => {
    //     try {
    //         requestUserPermission();
    //     } catch (err) {
    //         console.log(err);
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);



    useEffect(() => {
        let a = messaging().onMessage(async remoteMessage => {
            // console.log(remoteMessage);
            try {

                await onMessageReceived(remoteMessage);
            } catch (err) {
                console.log(err);
            }
        });
        // console.log(a);
        let b = messaging().setBackgroundMessageHandler(async msg => {
            // console.log(msg);
            try {

                await onMessageReceived(msg);
            } catch (err) {
                console.log(err);
            }
        });

        notifee.onBackgroundEvent(async ({ type, detail }) => {
            if (type === EventType.PRESS) {
                const data = detail?.notification?.data;
                const { type, host, rid } = data;

                if (type === 'd') {

                    navigation.reset({
                        index: 0,
                        routes: [{
                            name: 'CCPWebView', params: {
                                priorityUri: `${config.uri}/chat_mobile/direct`,
                                rid: rid,
                                type: type
                            }
                        }],
                    })
                }

                if (type === 'p') {

                    navigation.reset({
                        index: 0,
                        routes: [{
                            name: 'CCPWebView', params: {
                                priorityUri: `${config.uri}/chat_mobile/group`,
                                rid: rid,
                                type: type
                            }
                        }],
                    })
                }
            }
            // navigation.navigate("TabNavi", {
            //     screen: "Group",
            //     uri: 'http://172.16.53.80:3001/chat_mobile/group'
            // });

        })

        let d = notifee.onForegroundEvent(async ({ type, detail }) => {
            if (type === EventType.PRESS) {
                const data = detail?.notification?.data;
                const { type, host, rid } = data;

                if (type === 'd') {

                    navigation.reset({
                        index: 0,
                        routes: [{
                            name: 'CCPWebView', params: {
                                priorityUri: `${config.uri}/chat_mobile/direct`,
                                rid: rid,
                                type: type
                            }
                        }],
                    })
                }

                if (type === 'p') {
                    navigation.reset({
                        index: 0,
                        routes: [{
                            name: 'CCPWebView', params: {
                                priorityUri: `${config.uri}/chat_mobile/group`,
                                rid: rid,
                                type: type
                            }
                        }],
                    })

                }
            }
            // navigation.navigate("TabNavi", {
            //     screen: "Group",
            //     uri: 'http://172.16.53.80:3001/chat_mobile/group'
            // });

        })

        // messaging().onNotificationOpenedApp(remoteMessage => {
        // console.log(remoteMessage)
        // console.log('remotemessgae')
        // navigation.navigate("TabNavi", {
        //     screen: "Group",
        //     uri: 'http://172.16.53.80:3001/chat_mobile/group'
        // });
        // });

        // console.log(b);
        return a;
        // return unsubscribe;
    }, []);


    useEffect(() => {
        // Assume a message-notification contains a "type" property in the data payload of the screen to open

        messaging().onNotificationOpenedApp(remoteMessage => {
            console.log(
                'Notification caused app to open from background state:',
                remoteMessage.notification,
            );
            // navigation.navigate("TabNavi", {
            //     screen: "Group",
            //     uri: 'http://172.16.53.80:3001/chat_mobile/group'
            // });
        });

        // // Check whether an initial notification is available
        // messaging()
        //     .getInitialNotification()
        //     .then(remoteMessage => {
        //         console.log('remo')
        //         if (remoteMessage) {
        //             console.log(
        //                 'Notification caused app to open from quit state:',
        //                 remoteMessage.notification,
        //             );
        //             // setInitialRoute(remoteMessage.data.type); // e.g. "Settings"
        //             navigation.navigate("TabNavi", {
        //                 screen: "Group",
        //                 uri: 'http://172.16.53.80:3001/chat_mobile/group'
        //             });
        //         }
        //         // setLoading(false);
        //     });
        bootstrap().then((a) => {
            // console.log('init')
            // console.log(a)
        })

    }, []);

    return <></>;
};



export default Notification;
