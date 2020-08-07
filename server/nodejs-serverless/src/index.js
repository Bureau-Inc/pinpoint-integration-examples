import { callback } from './controller/callback';
import { userinfo } from './controller/userinfo';

const awsServerlessExpress = require('aws-serverless-express');
const express = require('serverless-express/express')
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Set routes
app.use('/', callback)
app.use('/', userinfo)

const server = awsServerlessExpress.createServer(app)
export const handler = (event, context) => { awsServerlessExpress.proxy(server, event, context) }

