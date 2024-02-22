import express from 'express';
import {fileURLToPath} from 'url';
import path from 'path';
import logger from 'morgan';
import cookieParser from "cookie-parser";
import indexRouter from './routes/index.js';
import tiktokRouter from "./routes/tiktok.js";
import admin from 'firebase-admin';
import * as serviceAccount from "./serviceAccountKey.json" assert {type: "json"};
import ticketRouter from "./routes/tickets.js";
import identifierRouter from "./routes/indetifiers.js";
import watermarkRouter from "./routes/watermark.js";
import countryRouter from "./routes/country.js";
import celebrityRouter from "./routes/celebirty.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

// Firebase configuration start.
const defaultApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount.default),
    databaseURL: "https://plant-b23ab-default-rtdb.firebaseio.com"
});


// Firebase configuration end.
// export const limiter = rateLimit({
//     windowMs: 10 * 60 * 1000, // 10 minutes
//     limit: 100,
//     standardHeaders: 'draft-7',
//     legacyHeaders: false,
// })
//
// // Apply the rate limiting middleware to all requests.
// app.use(limiter)


app.use(logger('combined'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/api/tickets', ticketRouter);
app.use('/api/tiktok', tiktokRouter);
app.use('/api/identifiers', identifierRouter);
app.use('/api/watermark', watermarkRouter);
app.use('/api/country', countryRouter);
app.use('/api/celebrity', celebrityRouter);

// app.get('/getData', (req, res) => {
//    return res.json({data: AES.encrpyt(JSON.stringify({time: new Date().getTime()}))})
// });


export default app;
