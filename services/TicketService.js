import {ZENDESK_API_EMAIL, ZENDESK_API_TOKEN, ZENDESK_API_URL} from "../consts.js";
import axios from "axios";
export default class TicketService {
    async createTicket(name, email, subject, message, user_id, tags = [], priority = 'normal') {
        const ticketData = {
            ticket: {
                subject: subject,
                comment: {body: message},
                priority: priority,
                requester: {name: name, email: email},
                tags: tags,
                custom_fields: [
                    {id: 11630599169820, value: "12333456"}
                ]
            },
        };

        const response = await this.sendRequest('tickets.json', 'POST', ticketData);
        return response.data;
    }

    async sendRequest(url, method, body) {
        return await axios.post(ZENDESK_API_URL + '/' + url, body, {
            auth: {
                username: ZENDESK_API_EMAIL + '/token',
                password: ZENDESK_API_TOKEN,
            },
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
