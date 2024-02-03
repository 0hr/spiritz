import express from 'express';
import {check, validationResult} from "express-validator";
import UserResponse from "../responses/UserResponse.js";
import UserService from "../services/UserService.js";
import {HasSecurity} from "../middlewares/HasSecurity.js";

const userRouter = express.Router();

/* GET users listing. */
userRouter.get('/', function (req, res, next) {
    res.send('respond with a resource');
});


const registerValidations = [
    HasSecurity,
    check('name')
        .exists().withMessage('Name is required'),
    check('email')
        .exists().withMessage('Email is required')
        .isEmail().withMessage('Email is not valid'),
    check('password')
        .exists().withMessage('Password is required')
        .isLength({min: 6}).withMessage('Password should be more than 6 characters')

];


userRouter.post('/register/email', registerValidations, async function (req, res, next) {
    const response = new UserResponse();
    try {
        const validation = validationResult(req);
        if (!validation.isEmpty()) {
            res.status(403);
            response.status.message = "validation error";
            response.status.code = 403;
            response.status.errors = validation;
            return res.json(response);
        }
        const userService = new UserService();
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const user = await userService.register(name, email, password);
        response.name = name;
        response.email = email;
    } catch (err) {
        res.status(500);
        response.status.message = err.message;
        response.status.code = 500;
    }

    return res.json(response);
});


export default userRouter;