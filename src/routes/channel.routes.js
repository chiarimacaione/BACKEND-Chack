import express from 'express'
import {userMiddleware} from '../middlewares/user.middleware.js'
import { createChannelController, getChannelsListController, getMessagesFromChannelController, sendMessageController } from '../controllers/channel.controller.js'
import isWorkspaceMemberMiddleware from '../middlewares/isWorkspaceMember.middleware.js'

const channelRoutes = express.Router()

channelRoutes.use(userMiddleware)

channelRoutes.post('/:workspace_id',isWorkspaceMemberMiddleware, createChannelController)

channelRoutes.get('/:workspace_id',isWorkspaceMemberMiddleware, getChannelsListController)

channelRoutes.post('/:workspace_id/:channel_id/send-message', isWorkspaceMemberMiddleware, sendMessageController)

channelRoutes.get('/:workspace_id/:channel_id', isWorkspaceMemberMiddleware, getMessagesFromChannelController)

export default channelRoutes