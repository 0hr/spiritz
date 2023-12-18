import admin from "firebase-admin";
import OpenAI from 'openai';
import {OPENAI_API_KEY} from "../consts.js";
import indetifiers from "../routes/indetifiers.js";

export default class IdentifierService {

    constructor() {
        this.openai = new OpenAI({
            apiKey: OPENAI_API_KEY,
        });
    }


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
        if (!result.exists) {
            throw new Error("Collection is empty");
        }
        const identifier = result.data();

        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4-vision-preview',
            max_tokens: 255,
            messages: [
                {
                    role: 'user',
                    content: [
                        {type: 'text', text: identifier.prompt},
                        {type: 'text', text: `if given is not found in the image, add 0 as status, otherwise 1. Make result as a json without markdown. The Answer is in answer field. The Status is in status field.`},
                        {type: 'text', text: `The answer should be given in the language indicated by the language code ${lang}.`},
                        {
                            type: 'image_url',
                            image_url: {
                                url: image,
                            }
                        },
                    ]
                }
            ]
        });
        return completion.choices[0]?.message?.content;
    }
}