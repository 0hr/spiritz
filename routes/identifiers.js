import express from 'express';
import IdentifierResponse from "../responses/IdentifierResponse.js";
import {IdentifierService} from "../services/IdentifierService.js";
import imageType from "image-type";
import IdentifierResultResponse from "../responses/IdentifierResultResponse.js";
import {Upload, UploadSound, UploadVideo} from "../middlewares/Upload.js";
import {ErrorHandle} from "../middlewares/HandleError.js";
import {HasSecurity} from "../middlewares/HasSecurity.js";

const identifierRouter = express.Router();

identifierRouter.get('/list', async (req, res) => {
    const response = new IdentifierResponse();
    try {
        const identifierService = new IdentifierService();
        response.items = await identifierService.getIdentifiers();
        return res.json(response);
    } catch (err) {
        res.status(500);
        response.status.message = err.message;
        response.status.code = 500;
    }
    return res.json(response);
});

identifierRouter.post('/identify', [Upload.single('image'), ErrorHandle, HasSecurity], async (req, res) => {
    const response = new IdentifierResultResponse();
    try {
        if (!req.body.id) {
            response.status.code = 500;
            response.status.message = 'Id is required';
            return res.json(response);
        }
        const id = req.body.id;
        const lang = req.body.lang || "english";
        const identifierService = new IdentifierService();
        const type = await imageType(req.file.buffer);
        const imageBase64 = `data:${type.mime};base64,${req.file.buffer.toString('base64')}`;

        const result = JSON.parse(await identifierService.identify(id, imageBase64, lang));
        if (!result.hasOwnProperty('status') || !result.hasOwnProperty('answer')) {
            throw new Error("Bad Response!")
        }
        if (!result.status) {
            res.status(400);
            response.status.code = 400;
            response.status.message = result.answer[0];
        }
        response.result = result.answer;
    } catch (err) {
        res.status(500);
        response.status.message = err.message;
        response.status.code = 500;
    }
    return res.json(response);
});

identifierRouter.post('/information',  [HasSecurity],async (req, res) => {
    const response = new IdentifierResultResponse();
    try {
        if (!req.body.value) {
            response.status.code = 500;
            response.status.message = 'Value is required';
            return res.json(response);
        }
        const value = req.body.value;
        const lang = req.body.lang || "english";
        const identifierService = new IdentifierService();

        response.result = [await identifierService.getInfo(value, lang)];

    } catch (err) {
        res.status(500);
        response.status.message = err.message;
        response.status.code = 500;
    }
    return res.json(response);
});

identifierRouter.post('/ask',  [Upload.single('image'), ErrorHandle, HasSecurity],async (req, res) => {
    const response = new IdentifierResultResponse();
    try {
        if (!req.body.value) {
            response.status.code = 500;
            response.status.message = 'Value is required';
            return res.json(response);
        }
        const value = req.body.value;
        const lang = req.body.lang || "english";
        const type = await imageType(req.file.buffer);
        const imageBase64 = `data:${type.mime};base64,${req.file.buffer.toString('base64')}`;

        const identifierService = new IdentifierService();

        response.result = [await identifierService.ask(imageBase64, value, lang)];

    } catch (err) {
        res.status(500);
        response.status.message = err.message;
        response.status.code = 500;
    }
    return res.json(response);
});

identifierRouter.post('/analyze-image',  [Upload.single('image'), ErrorHandle, HasSecurity],async (req, res) => {
    const response = new IdentifierResultResponse();
    try {
        const lang = req.body.lang || "english";
        const type = await imageType(req.file.buffer);
        const imageBase64 = `data:${type.mime};base64,${req.file.buffer.toString('base64')}`;

        const identifierService = new IdentifierService();

        const result = JSON.parse(await identifierService.analyzePhoto(imageBase64, lang))

        if (!result.hasOwnProperty('status')) {
            throw new Error("Bad Response!")
        }
        if (!result.status) {
            res.status(400);
            response.status.code = 400;
            response.status.message = result.hasOwnProperty('message') ? result.message : "Bad Response!";
        }
        response.result = result;

    } catch (err) {
        res.status(500);
        response.status.message = err.message;
        response.status.code = 500;
    }
    return res.json(response);
});

identifierRouter.post('/analyze-sound',  [UploadSound.single('file'), ErrorHandle, HasSecurity],async (req, res) => {
    const response = new IdentifierResultResponse();
    try {
        if (!req.body.value) {
            response.status.code = 500;
            response.status.message = 'Value is required';
            return res.json(response);
        }
        const value = req.body.value;
        const lang = req.body.lang || "english";
        const fileBase64 = {
            data: req.file.buffer.toString('base64'),
            mimeType: req.file.mimetype,
        };

        const identifierService = new IdentifierService();
        const result_str = await identifierService.analyzeSound(fileBase64, value, lang)
        const result = JSON.parse(result_str)

        if (!result.hasOwnProperty('status')) {
            throw new Error("Bad Response!")
        }
        if (!result.status) {
            res.status(400);
            response.status.code = 400;
            response.status.message = result.hasOwnProperty('message') ? result.message : "Bad Response!";
        }
        response.result = result;

        if (result.hasOwnProperty('speak')) {
            response.result.mp3 = await identifierService.textToSpeech(result.speak)
        }

    } catch (err) {
        res.status(500);
        response.status.message = err.message;
        response.status.code = 500;
    }

    return res.json(response);
});

identifierRouter.post('/analyze-video',  [UploadVideo.single('file'), ErrorHandle, HasSecurity],async (req, res) => {
    const response = new IdentifierResultResponse();
    try {
        const lang = req.body.lang || "english";
        const fileBase64 = {
            data: req.file.buffer.toString('base64'),
            mimeType: req.file.mimetype,
        };

        const identifierService = new IdentifierService();

        const result = JSON.parse(await identifierService.analyzeVideo(fileBase64, lang))

        if (!result.hasOwnProperty('status')) {
            throw new Error("Bad Response!")
        }

        if (!result.status) {
            res.status(400);
            response.status.code = 400;
            response.status.message = result.hasOwnProperty('message') ? result.message : "Bad Response!";
        }
        response.result = result;

        if (result.hasOwnProperty('speak')) {
            response.result.mp3 = await identifierService.textToSpeech(result.speak)
        }

    } catch (err) {
        res.status(500);
        response.status.message = err.message;
        response.status.code = 500;
    }

    return res.json(response);
});

identifierRouter.post('/analyze-animal-image',  [Upload.single('image'), ErrorHandle, HasSecurity],async (req, res) => {
    const response = new IdentifierResultResponse();
    try {
        if (!req.body.value) {
            response.status.code = 500;
            response.status.message = 'Value is required';
            return res.json(response);
        }
        const value = req.body.value;
        const type = await imageType(req.file.buffer);
        const lang = req.body.lang || "english";
        const fileBase64 = {
            data: req.file.buffer.toString('base64'),
            mimeType: type.mime,
        };

        const identifierService = new IdentifierService();

        const result = JSON.parse(await identifierService.analyzeAnimalImage(fileBase64, value, lang))

        if (!result.hasOwnProperty('status')) {
            throw new Error("Bad Response!")
        }

        if (!result.status) {
            res.status(400);
            response.status.code = 400;
            response.status.message = result.hasOwnProperty('message') ? result.message : "Bad Response!";
        }
        response.result = result;

        if (result.hasOwnProperty('speak')) {
            response.result.mp3 = await identifierService.textToSpeech(result.speak)
        }
    } catch (err) {
        res.status(500);
        response.status.message = err.message;
        response.status.code = 500;
    }

    return res.json(response);
});

export default identifierRouter;
