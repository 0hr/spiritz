import express from 'express';
import admin from "firebase-admin"
import path from "path";
import {__dirname} from "../app.js";

const indexRouter = express.Router();


/* GET home page. */
indexRouter.get('/', function(req, res, next) {
    //res.send('');
    return res.sendFile(path.join(__dirname, 'public/index.html'));
});

indexRouter.all('/terms', function (req, res, next) {
    //res.send('');
    return res.sendFile(path.join(__dirname, 'public/terms-of-use.html'));
});

indexRouter.all('/privacy', function (req, res, next) {
    //res.send('');
    return res.sendFile(path.join(__dirname, 'public/privacy-policy.html'));
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
