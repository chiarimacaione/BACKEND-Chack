import ChannelRepository from "../repository/channel.repository.js";
import MessageRepository from "../repository/message.repository.js";

export const createChannelController = async (req, res) => {
    try {
        const { workspace_id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                ok: false,
                message: 'Channel name is required',
            });
        }

        const channel_created = await ChannelRepository.createChannel({ name, workspace_id });
        const channels = await ChannelRepository.getAllChannelsByWorkspaceId(workspace_id);

        return res.status(201).json({
            ok: true,
            message: 'Channel created successfully',
            data: {
                new_channel: channel_created,
                channels
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            message: "Internal server error",
        });
    }
};


export const getChannelsListController = async (req, res) => {
    try {
        const { id } = req.user;
        const { workspace_id } = req.params;

        const channels = await ChannelRepository.getAllChannelsByWorkspaceId(workspace_id);

        return res.json({
            ok: true,
            status: 200,
            message: 'Channels list',
            data: {
                channels
            }
        });
    } catch (error) {
        console.error(error);
        return res.json({
            ok: false,
            message: "Internal server error",
            status: 500,
        });
    }
};

export const sendMessageController = async (req, res) => {
    try {
        const { channel_id, workspace_id } = req.params;
        const { content } = req.body;
        const { id } = req.user;

        if (!content) {
            return res.json({
                ok: false,
                message: 'Message content is required',
                status: 400
            });
        }

        const channel_selected = await ChannelRepository.getChannelById(channel_id);
        if (!channel_selected) {
            return res.json({
                ok: false,
                message: 'Channel not found',
                status: 404
            });
        }

        const new_message = await MessageRepository.createMessage({
            sender_user_id: id,
            content,
            channel_id
        });

        return res.json({
            ok: true,
            message: 'Message sent successfully',
            status: 201,
            data: {
                new_message
            }
        });
    } catch (error) {
        console.error(error);
        return res.json({
            ok: false,
            message: "Internal server error",
            status: 500,
        });
    }
};

export const getMessagesFromChannelController = async (req, res) => {
    try {
        const { channel_id, workspace_id } = req.params;
        const channel_selected = await ChannelRepository.getChannelById(channel_id);

        if (!channel_selected) {
            return res.json({
                ok: false,
                message: 'Channel not found',
                status: 404
            });
        }

        const messages = await MessageRepository.getAllMessagesFromChannel(channel_id);

        return res.json({
            ok: true,
            status: 200,
            message: 'Messages list',
            data: {
                messages
            }
        });
    } catch (error) {
        console.error(error);
        return res.json({
            ok: false,
            message: "Internal server error",
            status: 500,
        });
    }
};
