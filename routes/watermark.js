import BaseResponse from "../responses/BaseResponse.js";
import express from "express";
import multer from "multer";
import path from "path";
import WatermarkService from "../services/WatermarkService.js";
import WatermarkResponse from "../responses/WatermarkResponse.js";
import axios from "axios";
import {BASE_URL} from "../consts.js";

const watermarkRouter = express.Router();

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

watermarkRouter.get('/image/:url(*)', async (req, res) => {
    const watermarkResponse = new WatermarkResponse();
    const watermarkService = new WatermarkService();
    const parsedUrl = path.parse(req.params.url);
    const filename = parsedUrl.dir + '/' + parsedUrl.base;
    const filenameNoWm = parsedUrl.dir + '/' + parsedUrl.name + '_r' + parsedUrl.ext;
    let url;
    let isMoved = true;
    if (!await watermarkService.checkFile(filename)) {
        res.status(404);
        watermarkResponse.status.message = 'Image is not found';
        watermarkResponse.status.code = '404';
        return res.json(watermarkResponse);
    }
    if (await watermarkService.checkFile(filenameNoWm)) {
        url = await watermarkService.getS3Url(filenameNoWm);
    } else {
        url = watermarkService.getPixelbinUrl(filename, {"name": "remove", "plugin": "wm"});
        isMoved = false;
    }


    try {
        const imageResponse = await axios.get(url, {responseType: 'arraybuffer'});
        const contentType = imageResponse.headers['content-type'];
        if (/^image\/(png|jpeg|webp|gif)$/.test(contentType)) {
            if (!isMoved) {
                await watermarkService.uploadFile(filenameNoWm, imageResponse.data, contentType);
            }
            res.setHeader('Content-Type', imageResponse.headers['content-type']);

            return res.send(imageResponse.data);
        }
        res.status(400);
        if (contentType === 'application/json' || contentType === 'text/plain') {
            watermarkResponse.status.message = new TextDecoder('utf-8').decode(imageResponse.data);
        } else {
            watermarkResponse.status.message = 'Unknown error';
        }
    } catch (err) {
        watermarkResponse.status.message = err.message;
        res.status(500);
        watermarkResponse.status.code = 500;
    }

    watermarkResponse.url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    return res.json(watermarkResponse);
});

watermarkRouter.post('/remove', [uploadImage.single('image'), errorHandle], async (req, res) => {
    const response = new WatermarkResponse();
    try {
        const watermarkService = new WatermarkService();
        const file = req.file;
        const imageHash = await watermarkService.generateImageHash(file.buffer, 16, true);
        const fileExtension = path.extname(file.originalname).toLowerCase();

        const filepath = imageHash.substring(0, 2) + '/' + imageHash.substring(2, 4);
        const filename = filepath + '/' + imageHash.substring(4) + fileExtension;

        if (!await watermarkService.checkFile(filename)) {
            await watermarkService.uploadFile(filename, file, file.mimetype);
        }

        response.url = `${BASE_URL}/watermark/image/${filename}`;

        return res.json(response);
    } catch (err) {
        res.status(500);
        response.status.message = err.message;
        response.status.code = 500;

    }
    return res.json(response);
});

export default watermarkRouter;