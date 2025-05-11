import AWS from 'aws-sdk';
import * as fs from 'fs';

import { config } from 'dotenv';

config();

const bucket = process.env.AWS_BUCKET_NAME!;
const s3 = new AWS.S3();


export const uploadPDFToS3 = async (filename: string) => {
    const fileContent = fs.readFileSync(`./pdfs/${filename}`);

    const params = {
        Bucket: bucket,
        Key: filename,
        Body: fileContent,
        ContentType: 'application/pdf',
        Metadata: {
            'leido-por-correo': 'false'
        }
    };

    try {
        const uploadResult = await s3.upload(params).promise();
        console.log('Archivo subido correctamente:', uploadResult.Location);
        uploadResult.Location;
    } catch (error) {
        console.error('Error al subir archivo a S3:', error);
        new Error('Error al subir archivo a S3');
    }
};
