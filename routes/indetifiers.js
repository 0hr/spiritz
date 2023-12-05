import express from 'express';
import IdentifierResponse from "../responses/IdentifierResponse.js";
import IdentifierService from "../services/IdentifierService.js";
import multer from "multer";
import imageType from "image-type";
import BaseResponse from "../responses/BaseResponse.js";
import path from "path";
import IdentifierResultResponse from "../responses/IdentifierResultResponse.js";
import {check} from "express-validator";
import IsAuthenticated from "../middleware/IsAuthenticated.js";

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
        .exists().withMessage('Id is required')
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

identifierRouter.post('/identify', [IsAuthenticated, uploadImage.single('image'), errorHandle],async (req, res) => {
    const response = new IdentifierResultResponse();
    try {
        const id = req.body.id;
        const identifierService = new IdentifierService();
        const type = await imageType(req.file.buffer);
        const imageBase64 = `data:${type.mime};base64,${req.file.buffer.toString('base64')}`;
        response.result = await identifierService.identify(id, imageBase64);
    } catch (err) {
        res.status(500);
        response.status.message = err.message;
        response.status.code = 500;
    }
    return res.json(response);
});


export default identifierRouter;