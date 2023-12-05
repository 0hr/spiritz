import express from 'express';
import TiktokService from "../services/TiktokService.js";
import BaseResponse from "../responses/BaseResponse.js";
import TiktokResponse from "../responses/TiktokResponse.js";
import {check, validationResult} from 'express-validator';


const tiktokRouter = express.Router();

const validations = [
    check('url')
        .exists().withMessage('Url is required')
        .matches(/^https:\/\/(?:m|www|vm)?\.tiktok\.com\/.*$/).withMessage('Data is not tiktok url')
        .isURL().withMessage('Data is not url'),
];


/* GET home page. */
tiktokRouter.post('/get', validations, async (req, res, next) => {
    var response = new TiktokResponse();
    try {
        const validation = validationResult(req);
        if (!validation.isEmpty()) {
            res.status(403);
            response.status.message = "validation error";
            response.status.code = 403;
            response.status.errors = validation;
            return res.json(response);
        }
        const url = req.body.url;
        const tiktokService = new TiktokService();
        const result = await tiktokService.getUrl(url);

        response.video_url = result.url;
        response.nickname = result.nickname;
        response.video_description = result.description;
        response.url = url;
        response.id = result.id;
    } catch (err) {
        res.status(500);
        response.status.message = err.message;
        response.status.code = 500;
    }
    return res.json(response);
});

export default tiktokRouter;