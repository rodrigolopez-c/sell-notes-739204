import { Request, Response, RequestHandler } from "express";
import { v4 as uuidv4 } from "uuid";
import dynamoDB from "../utils/db";
import { HTTP_STATUS_CODES } from "../types/http-status-codes";

import generatePDF from "../utils/generatePDF";
import { uploadPDFToS3 } from "../utils/uploadS3";

import { config } from 'dotenv';
import AWS from 'aws-sdk';

config();

const notes_table = process.env.NOTES_TABLE_NAME;
const content_table = process.env.CONTENT_TABLE_NAME;

const clients_table = process.env.CLIENTS_TABLE_NAME;
const products_table = process.env.PRODUCTS_TABLE_NAME;
const addresses_table = process.env.ADDRESSES_TABLE_NAME;

const sqs = new AWS.SQS({ region: process.env.AWS_REGION });
const queueUrl = process.env.SQS_QUEUE_URL;

const bucket = process.env.AWS_BUCKET_NAME;

export const createSellNote = async (req: Request, res: Response) => {
    const { cliente, direccion_facturacion, direccion_envio, total } = req.body;

    try {

        const clientCheck = await dynamoDB.get({
            TableName: clients_table || '',
            Key: { id: cliente }
        }).promise();

        if (!clientCheck.Item) {
            res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ error: "Cliente no encontrado" });
        }

        const addressCheck = await dynamoDB.get({
            TableName: addresses_table || '',
            Key: { id: direccion_envio }
        }).promise();

        if (!addressCheck.Item) {
            res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ error: "Dirección de envío no encontrada" });
        }

        const newSellNote = {
            id: uuidv4(),
            cliente,
            direccion_facturacion,
            direccion_envio,
            total
        };

        const params = {
            TableName: notes_table || '',
            Item: newSellNote
        };

        await dynamoDB.put(params).promise();
        res.status(HTTP_STATUS_CODES.CREATED).json({ newSellNote });
    } catch (error) {
        console.error(error);
        res.status(HTTP_STATUS_CODES.SERVER_ERROR).json({ error: "Error al crear la nota" });
    }
};

export const createSellNoteContent: RequestHandler = async (req, res) => {
    const { nota_id, producto, cantidad, precio_unitario } = req.body;
  
    const noteCheck = await dynamoDB.get({ TableName: notes_table!, Key: { id: nota_id } }).promise();
    if (!noteCheck.Item) {
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ error: "Nota no encontrada" });
      return;
    }
  
    const productCheck = await dynamoDB.get({ TableName: products_table!, Key: { id: producto } }).promise();
    if (!productCheck.Item) {
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ error: "Producto no encontrado" });
      return;
    }
  
    const clientCheck = await dynamoDB.get({ TableName: clients_table!, Key: { id: noteCheck.Item.cliente } }).promise();
    if (!clientCheck.Item) {
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ error: "Cliente no encontrado" });
      return;
    }
  
    const importe = cantidad * precio_unitario;
    const newContent = { id: uuidv4(), nota_id, producto, cantidad, precio_unitario, importe };
    await dynamoDB.put({ TableName: content_table!, Item: newContent }).promise();
  
    const filename = generatePDF(noteCheck.Item, [newContent]);
    const pdfUrl = await uploadPDFToS3(filename);

    const downloadUrl = `https://${bucket}.s3.amazonaws.com/${filename}`;
  
    const messageBody = JSON.stringify({
        email: clientCheck.Item.correo_electronico,
        noteId: nota_id,
        downloadUrl: downloadUrl
    });

    await sqs.sendMessage({
        QueueUrl: queueUrl!,
        MessageBody: messageBody
    }).promise();
  
    res.status(HTTP_STATUS_CODES.CREATED).json({ newContent, pdfUrl });
    return;
  };