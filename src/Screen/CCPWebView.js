import WebView from 'react-native-webview';
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, BackHandler, Alert, SafeAreaView, Platform } from 'react-native';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import { config } from '../config';
import AsyncStorage from "@react-native-async-storage/async-storage";
import CookieManager from '@react-native-cookies/cookies';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import atob from 'core-js-pure/stable/atob';
import btoa from 'core-js-pure/stable/btoa';
import { decrypt, encrypt } from '../lib/crypto';
import { deleteToken, pushToken } from '../Notification';

const accessTokenName = btoa('access-token');

const axiosApi = axios.create({
    baseURL: config.api_url,
    withCredentials: true,
});

const CCPWebView = (props) => {

    const { uri, route, name, navigation } = props;

    const [first, setFirst] = useState(true);
    const [loginCookie, setLoginCookie] = useState();
    const [loading, setLoading] = useState(true);
    const [connection, setConnection] = useState();
    const [account, setAccount] = useState(true);
    const [url, setUrl] = useState(uri);
    const [isOpenChat, setIsOpenChat] = useState();
    const [webViewLocation, setWebViewLogcation] = useState();

    const ref = useRef();

    useEffect(() => {
        
        (async () => {
            
            let accessToken = await AsyncStorage.getItem(btoa('access-token'));
            if (!accessToken) {
                
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'LoginScreen' }],
                })

            }

        })();

    }, []);
    
    useEffect(() => {
        props.navigation.setOptions({

            headerTitle: 'CCP Mobile',
            headerTintStyle: { color: '#D7000F' },
            headerTitleAlign: 'center',
            headerStyle: {
                backgroundColor: '#D7000F',
            },
            headerTintColor: '#fff',

            headerLeft: () => (
                <MaterialCommunityIcons
                    marginLeft={10}
                    name={'arrow-left'}
                    size={26}
                    onPress={onAndroidBackPress}
                    color='white'
                />
                // />
                // <Button

                //     title="Back"
                //     onPress={() => {
                //         ref?.current.goBack()
                //     }}

                //     color={`${Platform.OS === 'android' ? '#D7000F':'white'}`}
                // />
            ),
            headerRight: () => (
                <Button
                    title="Reload"
                    onPress={() => {
                        ref?.current.reload()
                    }}
                    color={`${Platform.OS === 'android' ? '#D7000F' : 'white'}`}
                />
            ),

        })
    }, [ref, navigation, isOpenChat, webViewLocation])

    const params = route?.params;

    // 알림 클릭시 특정 주소로
    useEffect(() => {
        if (params?.priorityUri) {
            // console.log('post' + params.priorityUri)
            // if (ref) {
            //     const url = params.priorityUri;
            //     const newUrl = 'window.location = "' + url + '"';
            //     ref.current.injectJavaScript(newUrl)
            //     console.log(connection)
            //     // if (ref && params && connection === 'connect') {
                    
            //     //     const { rid, type } = params;
            //     //     const data = JSON.stringify({ rid: rid, type: type })
            //     //     console.log('post' + data)
            //     //     ref.current.postMessage(data)
            //     // }
            // }
            setUrl(params.priorityUri);
            
        }

    }, [params]);

    // 알림 클릭시 특정 주소로
    useEffect(() => {
        if (ref && params && connection === 'connect') {
            const { rid, type } = params;
            const data = JSON.stringify({ rid: rid, type: type })
            ref.current.postMessage(data)
        }

    }, [params, ref, connection]);

    // useFocusEffect(useCallback(() => {
    //     if (ref && first) {
    //         setFirst(false)
    //         console.log('reload1')
    //         ref.current.reload();
    //     }
    // }, [ref, first]));

    useFocusEffect(useCallback(() => {
        (async () => {
            const a = await AsyncStorage.getAllKeys();
            const ab = await AsyncStorage.getItem(btoa('refresh-token'));
            const ac = await AsyncStorage.getItem(btoa('access-token'));
            let date = new Date();
            let result = await CookieManager.set(url, {
                name: accessTokenName,
                value: ac,
                domain: config.baseDomain,
                // path: '/',
                // version: '1',
                // expires: new Date(date.setDate(date.getDate() + 10)).toUTCString(),
            })
            // await CookieManager.flush();
            setLoginCookie(ac)
            const ad = await AsyncStorage.getItem(btoa('user-idx'));
        })();
    }, [url]));
    // useFocusEffect(useCallback(() => {
    //     console.log(loginCookie)
    // }, [loginCookie]))
    // const reload = () => {

    //     if (ref) {
    //         ref?.current?.reload();
    //         console.log('reload')
    //     }
    // }

    const onMessage = async (e) => {
        const data = e.nativeEvent.data

        try {
            const result = JSON.parse(data)
            // {"data":"{cmd:logout, param:????}"}
            if (result?.data?.cmd == 'logout') {

                await deleteToken();

                await AsyncStorage.setItem(btoa("refresh-token"), btoa(''));
                await AsyncStorage.setItem(btoa("access-token"), btoa(''));
                await AsyncStorage.setItem(btoa("user-idx"), btoa(''))
                await AsyncStorage.setItem(btoa("USERID"), encrypt(''));
                await AsyncStorage.setItem(btoa("USERPASSWORD"), encrypt(''));
                await AsyncStorage.setItem("AUTOLOGINCHECK", 'false');

                // to loginScreen
                navigation.navigate('LoginScreen')
            }
            else if (result?.data?.cmd == 'connection') {
                setConnection(result?.data?.type);
            }
            else if (result?.data?.cmd == 'chat') {
                setIsOpenChat(result?.data?.type)
                
            
            }
        }
        catch (err) {
            console.log(err)
        }
    }


    // useEffect(() => {
    //     if (connection === 'reload') {
    //         ref?.current?.reload();
    //     }
    // }, [connection]);
    const onAndroidBackPress = useCallback((e) => {
        if (ref.current) {
            const path = webViewLocation?.url?.replace(config.uri, '');
            const canGoBack = webViewLocation?.canGoBack;
            switch (path) {
                case "/home":
                    if (canGoBack) {
                        ref?.current?.goBack();
                    } else {
                        Alert.alert("Hold on!", "앱을 종료하시겠습니까?", [
                            {
                                text: "취소",
                                onPress: () => null,
                            },
                            { text: "확인", onPress: () => BackHandler.exitApp() }
                        ]);
                    }
                    break;
                case "/chat_mobile/direct":
                case "/chat_mobile/favorite":
                case "/chat_mobile/group":
                    if (isOpenChat === 'open') {
                        ref.current.postMessage(JSON.stringify({ rid: '', type: 'exit' }))
                    } else {
                        if (canGoBack) {
                            ref?.current?.goBack();
                        } else {
                            Alert.alert("Hold on!", "앱을 종료하시겠습니까?", [
                                {
                                    text: "취소",
                                    onPress: () => null,
                                },
                                { text: "확인", onPress: () => BackHandler.exitApp() }
                            ]);
                        }
                    }
                    break;
                default:
                    break;
            }
            return true; // prevent default behavior (exit app)
        }
        return false;
    }, [ref, navigation, isOpenChat, webViewLocation]);

    useFocusEffect(useCallback(() => {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', onAndroidBackPress);
            return () => {
                BackHandler.removeEventListener('hardwareBackPress', onAndroidBackPress);
            };
        }
    }, [ref, webViewLocation, navigation, isOpenChat]));

    // useFocusEffect(useCallback(() => {
    //     console.log('rr1');
    //     (async () => {
    //         console.log('rr2');
    //         try {

    //             let result = await axios.post('http://172.16.53.80:11061/api/v1/auth/login',
    //                 { UserID: 'dhha83', pwd: '1234' },
    //                 {
    //                     withCredentials: true,
    //                     headers: {
    //                         ["Content-Type"]: "application/json",
    //                         ['site']: 'CCP',
    //                         ['mobile']: true,
    //                         ["client-id"]: 'kr.co.ccp',
    //                     }
    //                 });
    //             console.log(result);
    //         } catch (err) {
    //             console.log(err);
    //         }
    //         console.log('rr3');
    //     })()
    // }, []));

    useEffect(() => {
        if (account === false) {

            (async () => {
                let UserID = decrypt(await AsyncStorage.getItem(btoa('USERID')))
                let pwd = decrypt(await AsyncStorage.getItem(btoa('USERPASSWORD')))
                try {
                    let result = await axiosApi.post('/auth/login',
                        { UserID: UserID, pwd: pwd },
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
                            // console.log(tokenData)
                            await CookieManager.set(url, {
                                name: accessTokenName,
                                value: btoa(accessToken),
                                domain: config.baseDomain,
                                // path: '/',
                                // version: '1',
                                // expires: new Date(date.setDate(date.getDate() + 10)).toUTCString(),
                            })
                            if (ref) {
                                const newUrl = 'window.location = "' + url + '"';
                                ref.current.injectJavaScript(newUrl)
                            }

                        }
                        await pushToken(UserID);
                        // navigation.reset({
                        //     index: 0,
                        //     routes: [{ name: 'TabNavi' }],
                        // })
                        setAccount(true)
                        // if (ref) {
                        //     console.log('reload' + url)
                        //     ref.current.reload();
                        // }
                        // if (navigation) {
                        //     console.log('navi' + url)
                        //     navigation.navigate(name, { priorityUri: url })
                        // }
                    } else {
                        console.log('loginscrenn go')
                        setAccount(false)
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'LoginScreen' }]
                        })
                    }

                } catch (error) {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'LoginScreen' }]
                    })
                    console.log(error)
                }

            })();
        }
    }, [account])

    // useEffect(() => {
    //     console.log(webViewLocation)
    // }, [webViewLocation])
    return (<>
        {/* <Button title="aaa" onPress={reload}>aaaa</Button> */}
        {
            url ?
                <>
                    <WebView
                        source={{
                            uri: url,
                            // headers: {
                            //     Cookie: `${btoa('access-token')}=${btoa(JSON.stringify(loginCookie))}`,
                            // }
                        }}
                        ref={ref}
                        setSupportMultipleWindows={false}
                        onMessage={onMessage}
                        sharedCookiesEnabled={true}

                        allowsBackForwardNavigationGestures={true} // ios
                        onNavigationStateChange={(e) => {
                            setWebViewLogcation(e)
                            // console.log(e)
                            // console.log('ur'+url)
                            // CookieManager.clearAll();
                            // CookieManager.get(uri).then(res => {
                            //     console.log("CookieManager.get =>", res);
                            //     // if (!!res) {
                            //     //     console.log({ res })
                            //     //     CookieManager.clearAll(true).then(res => {
                            //     //         console.log("LoginScreen CookieManager.clearAll =>", res);
                            //     //     });
                            //     // }
                            // });
                        }}
                        onShouldStartLoadWithRequest={(request) => {
                            console.log('req')
                            console.log(request)
                            // If we're loading the current URI, allow it to load
                            // CookieManager.get(url).then(res => { console.log(res) })

                            if (request.url === url) {
                                console.log('true')
                                return true;
                            };
                            // We're loading a new URL -- change state first
                            setLoading(true)
                            console.log('false')
                            setUrl(url);
                            setAccount(false)

                            return false;
                        }}

                    />
                    <SafeAreaView />
                </>
                : <></>
        }
    </>)
}
export default CCPWebView;
