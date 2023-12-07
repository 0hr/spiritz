import BaseResponse from "../responses/BaseResponse.js";
import express from "express";
import multer from "multer";
import path from "path";
import WatermarkService from "../services/WatermarkService.js";
import WatermarkResponse from "../responses/WatermarkResponse.js";

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


watermarkRouter.post('/remove', [uploadImage.single('image'), errorHandle], async (req, res) => {
    const response = new WatermarkResponse();
    try {
        const watermarkService = new WatermarkService();
        const file = req.file;
        const imageHash = await watermarkService.generateImageHash(file.buffer, 16, true);
        const fileExtension = path.extname(file.originalname).toLowerCase();

        const filepath = imageHash.substring(0, 2) + '/' + imageHash.substring(2, 4);
        const filenameNoWm = filepath + imageHash.substring(4) + '_r' + fileExtension;
        const filename = filepath  + imageHash.substring(4) + fileExtension;

        let url;
        if (await watermarkService.checkFile(filenameNoWm)) {
            url = await watermarkService.getUrl(filenameNoWm)
        } else {
            if (!await watermarkService.checkFile(filename)) {
                await watermarkService.uploadFile(filename, file);
            }

            url = await watermarkService.removeWatermark(filename, filenameNoWm);
        }

        response.url = url;

        return res.json(response);
    } catch (err) {
        res.status(500);
        response.status.message = err.message;
        response.status.code = 500;

    }
    return res.json(response);
});

export default watermarkRouter;