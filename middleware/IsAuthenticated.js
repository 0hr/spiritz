import UserService from "../services/UserService.js";
import BaseResponse from "../responses/BaseResponse.js";

export default async function IsAuthenticated(req, res, next) {
    const userService = new UserService();
    const baseResponse = new BaseResponse()
    baseResponse.status.message = "Authentication failed";
    if (req.headers?.authorization?.startsWith('Bearer ')) {
        const idToken = req.headers.authorization.split('Bearer ')[1];
        console.log(idToken);
        try {
            req['currentUser'] = await userService.verify(idToken);
            return next();
        } catch (err) {
            res.status(401);
            baseResponse.status.message = err.message;
            baseResponse.status.code = 401;
            return res.json(baseResponse);
        }
    }

    res.status(401);
    baseResponse.status.message = "Authentication failed";
    baseResponse.status.code = 401;
    return res.json(baseResponse);
}