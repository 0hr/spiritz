import express from "express";
import path from "path";
import WatermarkService from "../services/WatermarkService.js";
import WatermarkResponse from "../responses/WatermarkResponse.js";
import axios from "axios";
import {BASE_URL} from "../consts.js";
import {Upload} from "../middlewares/Upload.js";
import {ErrorHandle} from "../middlewares/HandleError.js";
import {HasSecurity} from "../middlewares/HasSecurity.js";

const watermarkRouter = express.Router();

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

            const cacheTimeInSeconds = 3600;
            res.set({
                'Cache-Control': `public, max-age=${cacheTimeInSeconds}`,
                'Expires': new Date(Date.now() + cacheTimeInSeconds * 1000).toUTCString(),
            });

            return res.send(imageResponse.data);
        }

        res.status(400);
        watermarkResponse.status.message = 'Content is not ready';
        const imageResponseResult = new TextDecoder('utf-8').decode(imageResponse.data);
        if (contentType === 'application/json') {
            try {
                watermarkResponse.status.errors = JSON.parse(imageResponseResult);
            } catch (err) {
                watermarkResponse.status.errors = err.message;
            }
        } else if (contentType === 'text/plain') {
            watermarkResponse.status.errors = [imageResponseResult];
        } else {
            watermarkResponse.status.errors = [`Unknown Error ${contentType}`];
        }

    } catch (err) {
        watermarkResponse.status.message = err.message;
        res.status(500);
        watermarkResponse.status.code = 500;
    }

    watermarkResponse.url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    return res.json(watermarkResponse);
});

watermarkRouter.post('/remove',  [Upload.single('image'), ErrorHandle, HasSecurity], async (req, res) => {
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
