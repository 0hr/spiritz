import BaseResponse from "../responses/BaseResponse.js";
import AES from "../utils/AES.js";

export const HasSecurity = async (req, res, next) => {

    const baseResponse = new BaseResponse();

    if (Object.keys(req.body).length === 0) {
        res.status(500);
        baseResponse.status.code = 500;
        baseResponse.status.message = "You are not authorized.";
        return res.json(baseResponse);
    }

    const session = req.body.session || '';
    if (session === '') {
        res.status(500);
        baseResponse.status.code = 500;
        baseResponse.status.message = "You are not authorized. Session are required.";
        return res.json(baseResponse);
    }

    let sessionData;
    let time

    try {
        sessionData = JSON.parse(AES.decrypt(session));

    } catch (err) {
        res.status(500);
        baseResponse.status.code = 500;
        baseResponse.status.message = ' You are not authorized. Invalid session';
        return res.json(baseResponse);
    }

    time = new Date().getTime();
   // console.log(time, sessionData.time, (time - sessionData.time));
    if ((time - sessionData.time)  > 1000 * 60 * 2) {
        res.status(500);
        baseResponse.status.code = 500;
        baseResponse.status.message = 'You are not authorized. Expired session'
        return res.json(baseResponse);
    }

    next();
};
