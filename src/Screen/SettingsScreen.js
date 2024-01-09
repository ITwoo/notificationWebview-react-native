import axios from 'axios';
import { useEffect, useState } from 'react';
import atob from 'core-js-pure/stable/atob';
import btoa from 'core-js-pure/stable/btoa';
import { config } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

const axiosApi = axios.create({
    baseURL: config.api_url,
    withCredentials: true,
});

const SettingsScreen = () => {

    const [profileImage, setProfileImage] = useState();

    useEffect(() => {

        (async () => {
            try {

                const refreshToken = atob(await AsyncStorage.getItem(btoa('refresh-token')));
                const accessToken = atob(await AsyncStorage.getItem(btoa('access-token')));

                let tokenData = jwtDecode(accessToken)

                let response = await axiosApi.get('/auth/me', {
                    withCredentials: true,
                    headers: {
                        ["Content-Type"]: "application/json",
                        ['site']: 'CCP',
                        ['mobile']: true,
                        ["client-id"]: 'kr.co.ccp',
                        "authorization": "Bearer " + accessToken,
                        "refresh-token": "Bearer " + refreshToken,
                        "user-idx": tokenData.idx
                    }
                }
                )
                const photo = response.data.data.Photo;
                // photo = (photo?.length || 0) < 100 ? photo
                setProfileImage(photo)
                console.log(result2.data.data.Photo)
            } catch (err) {
                console.log(err)
            }

        })();
    }, [])

    const logo = {
        uri: profileImage,
        width: 64,
        height: 64,
    };

    return (
        <>
            {/* <Image source={ } /> */}
        </>

    )
}

export default SettingsScreen;