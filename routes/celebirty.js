import express from 'express';
import IdentifierResultResponse from "../responses/IdentifierResultResponse.js";
import CelebrityService from "../services/CelebrityService.js";
import {ErrorHandle} from "../middlewares/HandleError.js";
import {UploadImage} from "../middlewares/UploadImage.js";
import {HasSecurity} from "../middlewares/HasSecurity.js";

const celebrityRouter = express.Router();

celebrityRouter.post('/identify', [UploadImage.single('image'), ErrorHandle, HasSecurity], async (req, res) => {
    const response = new IdentifierResultResponse();
    try {
        const celebrityService = new CelebrityService();
        const imageBase64 = req.file.buffer.toString('base64');
        response.result = await celebrityService.recognize(imageBase64);
    } catch (err) {
        res.status(500);
        response.status.message = err.message;
        response.status.code = 500;
    }
    return res.json(response);
});


export default celebrityRouter;