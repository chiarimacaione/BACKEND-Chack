import express from 'express';
import { createMessage, getMessagesByChannel } from '../controllers/message.controller.js';

const messageRoutes = express.Router();

messageRoutes.post('/', createMessage)
messageRoutes.get('/:channel_id', getMessagesByChannel)

export default messageRoutes;
