import express from 'express';
import {check, validationResult} from "express-validator";
import TicketResponse from "../responses/TicketResponse.js";
import TicketService from "../services/TicketService.js";
import {HasSecurity} from "../middlewares/HasSecurity.js";
import {APP_NAME} from "../consts.js";

const ticketRouter = express.Router();

const validations = [
    HasSecurity,
    check('name')
        .exists().withMessage('Name is required'),
    check('user_id')
        .exists().withMessage('User Id is required'),
    check('tags')
        .exists().withMessage('Tags is required')
        .isArray().withMessage('Tags should be array'),
    check('email')
        .exists().withMessage('Email is required')
        .isEmail().withMessage('Email is not valid'),
    check('subject')
        .exists().withMessage('Subject is required'),
    check('message')
        .exists().withMessage('Name is required')
];

ticketRouter.post('/create', validations, async (req, res) => {
    const response = new TicketResponse()
    try {
        const validation = validationResult(req);
        if (!validation.isEmpty()) {
            res.status(403);
            response.status.message = "validation error";
            response.status.code = 403;
            response.status.errors = validation;
            return res.json(response);
        }

        const name = req.body.name;
        const email = req.body.email;
        const message = req.body.message;
        const subject = req.body.subject + `(${APP_NAME})`;
        const tags = req.body.tags;
        const userId = req.body.user_id;
        const ticketService = new TicketService();
        const ticket = await ticketService.createTicket(name, email, subject, message, userId, tags);

        if (!ticket.hasOwnProperty('ticket')) {
            throw new Error('Ticket is not created');
        }

        response.ticket_id = ticket.ticket.id;
        response.subject = ticket.ticket.id;
        response.ticket_status = ticket.ticket.status;
        res.json(response);
    } catch (err) {
        res.status(500);
        response.status.message = err.message;
        response.status.code = 500;
    }

    return res.json(response);
})
export default ticketRouter;
