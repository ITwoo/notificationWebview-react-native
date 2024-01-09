import CryptoJS from 'crypto-js'
import sha512 from 'js-sha512'

const algorithm = 'aes-256-cbc'
const secretKey = sha512('zhfpstmqhdks').substring(0, 32)
const secretIV = sha512('Korens_Work_Apps').substring(0, 16)


export function encrypt(string) {
    return CryptoJS.AES.encrypt(string, secretKey, { iv: secretIV }).toString()
}

export function decrypt(string) {
    return CryptoJS.AES.decrypt(string, secretKey, { iv: secretIV }).toString(CryptoJS.enc.Utf8)
}


