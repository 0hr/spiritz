import express from "express";
import geoip from "geoip-lite";
import CountryService from "../services/CountryService.js";
import CountryPredictResultResponse from "../responses/CountryPredictResultResponse.js";
import {HasSecurity} from "../middlewares/HasSecurity.js";

const countryRouter = express.Router();

countryRouter.post('/predict',[HasSecurity], async(req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const countryService = new CountryService();
    const ipLookup =  geoip.lookup(ip);
    const result = countryService.predict(ipLookup.country);
    const response = new CountryPredictResultResponse()
    response.result = result;
    return res.json(response);
});

export default countryRouter;
