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
//     input: "Merhaba! Bu minik dostumuz oldukça endişeli ve korkmuş görünüyor. Belki yalnız kaldığı için, belki de duyduğu bir sesten veya bir şeyden korktuğu için böyle sesler çıkarıyor olabilir. En iyisi ona sakince yaklaşıp güvende olduğunu hissettirmek ve etrafta onu neyin korkuttuğunu bulmaya çalışmak. Eğer bir yeri acımıyorsa ve bu durum sık sık tekrar ediyorsa, bir uzmandan destek almak en doğrusu olacaktır.",
//     instructions: "Use a warm, reassuring voice that sounds like an experienced veterinarian giving friendly, practical advice to a pet owner. Speak clearly and at a calm, steady pace. Keep sentences short and conversational, emphasize key tips, and finish each point with an encouraging tone.",
// });
//
// const buffer = Buffer.from(await mp3.arrayBuffer());
// await fs.promises.writeFile(speechFile, buffer);












// fs.writeFileSync('speech.mp3', audioBuf);

const name = calculateMD5Hash(Date.now());
const uploadParams = {
    Bucket:  AWS_S3_BUCKETNAME,
    Key:    `tts/identifier/${name}.mp3`,
    Body:   audioBuf,
    ContentType: 'audio/mpeg',
    ContentLength: audioBuf.length
};



console.log('🔗  URL (valid 24 h):', signedUrl);
