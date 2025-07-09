import { S3Client } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { Agent as HttpsAgent } from "https";
import {AWS_S3_REGION} from "../consts.js";

const s3Client = new S3Client({
    region: AWS_S3_REGION,
    requestHandler: new NodeHttpHandler({
        httpsAgent: new HttpsAgent({ keepAlive: true, maxSockets: 50 })
    }),
});

export default s3Client;
