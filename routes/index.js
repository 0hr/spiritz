import express from 'express';
import BaseResponse from "../responses/BaseResponse.js";
import admin from "firebase-admin"

const indexRouter = express.Router();

/* GET home page. */
indexRouter.all('/', function (req, res, next) {
    const baseResponse = new BaseResponse();
    baseResponse.status.code = 200;
    baseResponse.status.message = 'Api is working';
    res.json(baseResponse);
});


indexRouter.get('/configs', async (req, res, next) => {
    const versionNumber = req.query.version || false;
    let version = {};
    if (versionNumber !== false) {
        version = await admin.remoteConfig().getTemplateAtVersion(versionNumber);
    } else {
        version = await admin.remoteConfig().getTemplate();
    }
    res.json(version);
});


export default indexRouter;
