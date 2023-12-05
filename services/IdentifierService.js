import admin from "firebase-admin";
import OpenAI from 'openai';
import {OPENAI_API_KEY} from "../consts.js";

export default class IdentifierService {
    async getIdentifiers() {
        const db = admin.firestore();
        const collection = db.collection('identifications');
        const result = await collection.get()
        if (result.empty) {
            throw new Error("Collection is empty");
        }

        const list = [];
        result.forEach((row) => {
            list.push({
                id: row.id,
                name: row.data().name,
                prompt: row.data().prompt
            })
        })
        return list;
    }


    async identify(id, image) {
        const db = admin.firestore();
        const collection = db.collection('identifications');
        const result = await collection.doc(id).get()
        if (result.empty) {
            throw new Error("Collection is empty");
        }
        const identifier = result.data();

        const openai = new OpenAI({
            apiKey: OPENAI_API_KEY,
        });

        const completion = await openai.chat.completions.create({
            model: 'gpt-4-vision-preview',
            messages: [
                {
                    role: 'user',
                    content: [
                        {type: 'text', 'text': identifier.prompt},
                        {
                            type: 'image_url',
                            image_url: {
                                url: image,
                            }
                        }
                    ]
                }
            ]
        });

        const message =  completion.choices[0]?.message?.content;

        const regExp = /\((.*)\)/;
        const match = message.match(regExp);

        return match.length > 0 ? match[1] : "Object is not found";
    }
}