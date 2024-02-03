import * as vision from "@google-cloud/vision";

export default class CelebrityService {
    async recognize(image) {

        const client = new vision.v1p4beta1.ImageAnnotatorClient({
            keyFilename: 'visionServiceAccountKey.json'
        });
        const detectionResult = await client.faceDetection({
            image: {content: image},
            imageContext: {
                "faceRecognitionParams": {
                    "celebritySet": ["builtin/default"]
                }
            }
        });

        if (detectionResult.length < 1) {
            throw new Error('Celebrity was\'t found');
        }

        const celebirties = {};
        const result = detectionResult[0];
        for (const item of result.faceAnnotations) {
            const recognitionResult = item.recognitionResult;
            for (const recognitionItem of recognitionResult) {
                const celebrity = recognitionItem.celebrity;
                celebirties[celebrity.name] = {
                    name: celebrity.displayName,
                    description: celebrity.description,
                    confidence: recognitionItem.confidence
                };
            }

        }

        return Object.values(celebirties);
    }
}
