import BaseResponse from "../responses/BaseResponse.js";

export const ErrorHandle = (err, req, res, next) => {
    if (err instanceof Error) {
        res.status(500);
        const baseResponse = new BaseResponse();
        baseResponse.status.code = 500;
        baseResponse.status.message =  err.message;
        return res.json(baseResponse);
    }

    next()
};