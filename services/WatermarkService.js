import {AWS_S3_BUCKETNAME, AWS_S3_REGION, PIXELBIN_API_CLOUD_NAME, PIXELBIN_ZONE} from '../consts.js';
import {url} from '@pixelbin/admin';
import {GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {imageHash} from "image-hash";
import axios from "axios";
import {getSignedUrl,} from "@aws-sdk/s3-request-presigner";

export default class WatermarkService {
    constructor() {
        this.s3Client = new S3Client({
            region: AWS_S3_REGION,
        });
    }

    async checkFile(filename) {
        try {
            const params = {
                Bucket: AWS_S3_BUCKETNAME,
                Key: filename,
            };
            const headCommand = new HeadObjectCommand(params);
            await this.s3Client.send(headCommand);
            return true;
        } catch (err) {
            return false;
        }
    }

    async uploadFile(filename, file) {
        const params = {
            Bucket: AWS_S3_BUCKETNAME,
            Key: filename,
            Body: file.buffer,
            ContentType: file.mimetype,
        };
        const uploadCommand = new PutObjectCommand(params);
        await this.s3Client.send(uploadCommand);

        return filename;
    }

    async removeWatermark(filename, filenameNoWm) {
        const obj = {
            cloudName: PIXELBIN_API_CLOUD_NAME,
            zone: PIXELBIN_ZONE,
            version: "v2",
            transformations: [{"name": "remove", "plugin": "wm"}],
            filePath: filename,
        };


        const cdnUrl = url.objToUrl(obj);

        const response = await axios.get(cdnUrl, {responseType: 'arraybuffer'});
        await this.uploadFile(filenameNoWm, response.data)

        return await this.getUrl(filenameNoWm);
    }

    async getUrl(filename) {
        const params = {
            Bucket: AWS_S3_BUCKETNAME,
            Key: filename,
        };

        const command = new GetObjectCommand(params);

        return await getSignedUrl(this.s3Client, command, {expiresIn: 3600});
    }

    async generateImageHash(fileBuffer, hashSize, flag) {
        return new Promise((resolve, reject) => {
            imageHash({data: fileBuffer}, hashSize, flag, (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            });
        });
    }
}