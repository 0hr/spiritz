import express from 'express';
import IdentifierResponse from "../responses/IdentifierResponse.js";
import IdentifierService from "../services/IdentifierService.js";
import multer from "multer";
import imageType from "image-type";
import BaseResponse from "../responses/BaseResponse.js";
import path from "path";
import IdentifierResultResponse from "../responses/IdentifierResultResponse.js";
import {check, validationResult} from "express-validator";

const identifierRouter = express.Router();

identifierRouter.get('/list',async (req, res) => {
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

const storage = multer.memoryStorage();
const uploadImage = multer({
    storage: storage,
    limits: {fileSize: 10 * 1024 * 1024},
    fileFilter: async (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
            return cb(null, true);
        } else {
            cb(new Error("Invalid file"), true);
        }
    },
});

const validations = [
    check('id')
        .exists().withMessage('Id is required'),
    check('lang')
        .exists().withMessage('Language is required'),
    uploadImage.single('image'),
];

const errorHandle = (err, req, res, next) => {
    console.log(err);
    if (err instanceof Error) {
        res.status(500);
        const baseResponse = new BaseResponse();
        baseResponse.status.code = 500;
        baseResponse.status.message = err.message;
        return res.json(baseResponse);
    }

    next()
};

identifierRouter.post('/identify', [uploadImage.single('image'), errorHandle],async (req, res) => {
    const response = new IdentifierResultResponse();
    try {
        if (!req.body.id) {
            baseResponse.status.code = 500;
            baseResponse.status.message = 'Id is required';
            return res.json(baseResponse);
        }
        const id = req.body.id;
        const lang = req.body.lang || "english";
        const identifierService = new IdentifierService();
        const type = await imageType(req.file.buffer);
        const imageBase64 = `data:${type.mime};base64,${req.file.buffer.toString('base64')}`;
        const result = JSON.parse(await identifierService.identify(id, imageBase64, lang));
        if (result.status === 0) {
            res.status(400);
            response.status.code = 400;
            response.status.message = result.answer;
        }
        response.result = result.answer;
    } catch (err) {
        res.status(500);
        response.status.message = err.message;
        response.status.code = 500;
    }
    return res.json(response);
});


export default identifierRouter;