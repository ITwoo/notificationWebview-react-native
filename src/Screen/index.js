
import React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ChatScreen from './ChatScreen';
import SettingsScreen from './SettingsScreen';
import DashBoardScreen from './DashBoardScreen';
import GroupScreen from './GroupScreen';
import BookMarkScreen from './BookMarkScreen';
import CCPWebView from './CCPWebView';
import { config } from '../config';
const Tab = createBottomTabNavigator();

function Screen() {
    return (
        <>
            <Tab.Navigator
                initialRouteName='DashBoard'
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;

                        if (route.name === 'Chat') {
                            iconName = focused ? 'chatbox-ellipses' : 'chatbox-ellipses-outline';
                            return <Ionicons name={iconName} size={size} color={color} />;
                        }
                        if (route.name === 'BookMark') {
                            iconName = focused ? 'bookmark-check' : 'bookmark-check-outline';
                            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
                        }
                        if (route.name === 'Group') {
                            iconName = focused ? 'account-group' : 'account-group-outline';
                            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
                        }

                        if (route.name === 'DashBoard') {
                            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
                            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
                        }
                        if (route.name === 'Settings') {
                            iconName = focused ? 'reorder-three' : 'reorder-three-outline';
                            return <Ionicons name={iconName} size={size} color={color} />;
                        }
                    },
                })}
            >
                <Tab.Screen
                    name="DashBoard"
                    // component={DashBoardScreen}
                    children={({ route, navigation }) => <CCPWebView uri={`${config.uri}/home`} route={route} navigation={navigation} name="DashBoard" />}

                />
                <Tab.Screen
                    name="Chat"
                    // component={CCPWebView}
                    // props={{uri:'http://172.16.53.80:3001/home'}}
                    children={({ route, navigation }) => <CCPWebView uri={`${config.uri}/chat_mobile/direct`} route={route} navigation={navigation} name="Chat" />}

                />
                <Tab.Screen
                    name="BookMark"
                    // component={CCPWebView}
                    // props={{uri:'http://172.16.53.80:3001/chat_mobile/direct'}}
                    children={({ route, navigation }) => <CCPWebView uri={`${config.uri}/chat_mobile/favorite`} route={route} navigation={navigation} name="BookMark" />}

                />
                <Tab.Screen
                    name="Group"
                    // component={GroupScreen}
                    children={({ route, navigation }) => <CCPWebView uri={`${config.uri}/chat_mobile/group`} route={route} navigation={navigation} name="Group" />}

                />
                <Tab.Screen
                    name="Settings"
                    // component={SettingsScreen}
                    children={({ route, navigation }) => <SettingsScreen route={route} navigation={navigation} name="Settings" />}

                />
            </Tab.Navigator>
        </>
    );
}

export default Screen;
