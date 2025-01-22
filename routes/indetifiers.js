import express from 'express';
import IdentifierResponse from "../responses/IdentifierResponse.js";
import IdentifierService from "../services/IdentifierService.js";
import imageType from "image-type";
import IdentifierResultResponse from "../responses/IdentifierResultResponse.js";
import {UploadImage} from "../middlewares/UploadImage.js";
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

identifierRouter.post('/identify', [UploadImage.single('image'), ErrorHandle, HasSecurity], async (req, res) => {
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
        if (result.status === 0) {
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

export default identifierRouter;
