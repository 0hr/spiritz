// import fs from "fs";
// import path from "path";
// import OpenAI from "openai";
// import {OPENAI_API_KEY} from "./consts.js";
//
// const openai = new OpenAI({
//     apiKey: OPENAI_API_KEY
// });
// const speechFile = path.resolve("./speech.mp3");
//
// const mp3 = await openai.audio.speech.create({
//     model: "gpt-4o-mini-tts",
//     voice: "coral",
//     input: "Köpeğiniz ayrılık kaygısı yaşıyor veya bir şeye ulaşamadığı için çok gergin olabilir. Sakin kalmasına yardımcı olun ve bu davranışı tetikleyen durumlar üzerinde çalışın.",
//     instructions: "Use a warm, reassuring voice that sounds like an experienced veterinarian giving friendly, practical advice to a pet owner. Speak clearly and at a calm, steady pace. Keep sentences short and conversational, emphasize key tips, and finish each point with an encouraging tone.",
// });
//
// const buffer = Buffer.from(await mp3.arrayBuffer());
// await fs.promises.writeFile(speechFile, buffer);
//


import {VERTEX_API_PROJECT_ID} from "./consts.js";
import {VertexAI} from "@google-cloud/vertexai";

const PROJECT_ID = VERTEX_API_PROJECT_ID;

// const LOCATION = 'us-central1';

const KEY_PATH = './vertexServiceAccountKey.json';

this.vertexAI = new VertexAI({
    project: PROJECT_ID,
    // location: LOCATION,
    googleAuthOptions: {
        keyFilename: KEY_PATH
    }
});

const MODEL = 'gemini-2.5-pro';
const generativeModel = this.vertexAI.getGenerativeModel({
    model: MODEL,
});

const response = await generativeModel.generateContent(request);