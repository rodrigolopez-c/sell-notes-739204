import dotenv from "dotenv";
import AWS from "aws-sdk";

dotenv.config();

AWS.config.update({
    region: process.env.AWS_REGION, 
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_KEY!,
        sessionToken: process.env.AWS_SESSION_TOKEN!
    }
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export default dynamoDB;