import admin from "firebase-admin";
import OpenAI from 'openai';
import {OPENAI_API_KEY} from "../consts.js";
import indetifiers from "../routes/indetifiers.js";

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


    async identify(id, image, lang) {
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
                        {type: 'text', 'text': `The answer should be in the ${lang} language.`},
                        {
                            type: 'image_url',
                            image_url: {
                                url: image
                            }
                        },
                    ]
                }
            ]
        });
        return completion.choices[0]?.message?.content;
    }
}