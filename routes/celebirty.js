import express from 'express';
import IdentifierResultResponse from "../responses/IdentifierResultResponse.js";
import CelebrityService from "../services/CelebrityService.js";
import {ErrorHandle} from "../middlewares/HandleError.js";
import {Upload} from "../middlewares/Upload.js";
import {HasSecurity} from "../middlewares/HasSecurity.js";

const celebrityRouter = express.Router();

celebrityRouter.post('/identify', [Upload.single('image'), ErrorHandle, HasSecurity], async (req, res) => {
    const response = new IdentifierResultResponse();
    try {
        const celebrityService = new CelebrityService();
        const imageBase64 = req.file.buffer.toString('base64');
        const result = await celebrityService.recognize(imageBase64);
        if (result.length > 0) {
            response.result = result;
        } else {
            res.status(400);
            response.status = 400;
            response.result = [];
        }
    } catch (err) {
        res.status(500);
        response.status.message = err.message;
        response.status.code = 500;
    }
    return res.json(response);
});

export default celebrityRouter;
