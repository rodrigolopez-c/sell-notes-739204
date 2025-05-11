import express, { Request, Response } from 'express';
import routes from './routes/index';
import { config } from 'dotenv';

config();

const app = express();

app.use(routes);

const port = process.env.PORT || 3002;

app.get('', (req: Request, res: Response) => {
    res.send('Api works');
});

app.listen(port, () => {
    console.log(`App is running in port ${port}`);
});