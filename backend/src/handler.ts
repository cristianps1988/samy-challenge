import serverless from 'serverless-http';
import { app } from './infrastructure/app.js';

export const handler = serverless(app);
