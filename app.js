import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import logger from 'morgan';
import cookieParser from "cookie-parser";
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import tiktokRouter from "./routes/tiktok.js";
import admin from 'firebase-admin';
import * as serviceAccount from "./serviceAccountKey.json" assert { type: "json" };
import 'dotenv/config'
import IsAuthenticated from "./middleware/IsAuthenticated.js";
import ticketRouter from "./routes/tickets.js";
import rateLimit from "express-rate-limit";
import identifierRouter from "./routes/indetifiers.js";
import BaseResponse from "./responses/BaseResponse.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Firebase configuration start.
const defaultApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount.default),
    databaseURL: "https://plant-b23ab-default-rtdb.firebaseio.com"
});

// Firebase configuration end.
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
})

// Apply the rate limiting middleware to all requests.
app.use(limiter)

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(path.dirname(__dirname), 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/tickets', ticketRouter);
app.use('/tiktok', IsAuthenticated, tiktokRouter);
app.use('/identifiers', identifierRouter);


export default app;