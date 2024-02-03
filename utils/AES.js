import {AUTH_KEY} from "../consts.js";
import * as crypto from "crypto";

export default class AES {
    static algo = 'aes-256-ecb';
    static encrpyt(value) {
        console.log(process.env.AUTH_KEY);
        console.log(AUTH_KEY);
        let cipher = crypto.createCipheriv(AES.algo, AUTH_KEY, '');
        let encrypted = cipher.update(value, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return encrypted;
    };

    static decrypt(encrypted) {
        let decipher = crypto.createDecipheriv(AES.algo, AUTH_KEY, '');
        let decrypted = decipher.update(encrypted, 'base64', 'utf8');
        return (decrypted + decipher.final('utf8'));
    };
}

