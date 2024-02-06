import admin from 'firebase-admin';
import OpenAI from 'openai';
import {OPENAI_API_KEY} from '../consts.js';

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
            throw new Error('Collection is empty');
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
            throw new Error('Collection is empty');
        }
        const identifier = result.data();

        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4-vision-preview',
            max_tokens: 255,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: "Execute the prompt and following instructions. Only perform the specified actions and refrain from any additional actions."
                        },
                        {
                            type: 'text',
                            text: `Prompt: ${identifier.prompt}.`
                        },
                        {
                            type: 'text',
                            text: "If the given item is not found in the image, assign the status as 0; otherwise, assign it as 1. Present the results as a JSON format without markdown."
                        },
                        {
                            type: 'text',
                            text: "Use the 'status' field for the assigned status. Place the answer in the 'answer' field as array. If more than one, multiple items are identified, include them in the 'answer' field as an array in each item. "
                        },
                        {
                            type: 'text',
                            text: "If no items are identified, add the answer is in answer field as an array as a negative answer. Only Provide answer and status fields and provide only answers in 'answer' field as an array."
                        },
                        {
                            type: 'text',
                            text: "Answered each item should not be json. Each item should be a text. "
                        },
                        {
                            type: 'text',
                            text: `Provide the answer in the language indicated by the language code ${lang}, and refrain from translating JSON keys.`
                        },
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

    async getInfo(value, lang) {

        const completion = await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            max_tokens: 255,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: "Execute the prompt and following instructions. Only perform the specified actions and refrain from any additional actions."
                        },
                        {
                            type: 'text',
                            text: 'Give me information about ' + value
                        },
                        {
                            type: 'text',
                            text: value + ' must be first sentence and inside parenthesis.'
                        },
                        {
                            type: 'text',
                            text: `Provide the answer in the language indicated by the language code ${lang}`
                        },
                    ]
                }
            ]
        });
        return completion.choices[0]?.message?.content;
    }
}
