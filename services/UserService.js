import admin from "firebase-admin"

export default class UserService {
    async register(name, email, password) {
        const user = {
            displayName: name,
            email: email,
            password: password,
            emailVerified: false,
            disabled: false,
        };
        return await admin.auth().createUser(user);
    }

    async login(email, password) {
        return await admin.auth().getUserByEmail(email);
    }

    async verify(idToken) {
        return await admin.auth().verifyIdToken(idToken);
    }

    async createToken(user) {
        return await admin.auth().createCustomToken(user.uid)
    }
}
