#!/usr/bin/env node

import AES from "../utils/AES.js";
import axios from "axios";

for (let j=0; j<10; j++) {
    const url = 'https://6senseapp.com/api/country/predict';
    const promises = [];
    for (let i = 0; i < 20; i++) {
        const session = AES.encrypt(JSON.stringify({time: new Date().getTime()}));
        promises.push(axios.post(url, {session: session}));

    }

    const result = await Promise.all(promises);

    for (const item of result) {
        console.log(item.status, item.data);
    }
}

