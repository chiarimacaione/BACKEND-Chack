import WorkspaceRepository from "../repository/workspace.repository.js";
import UserRepository from "../repository/user.repository.js";
import { ServerError } from "../utils/errors.utils.js";
import channelRepository from "../repository/channel.repository.js";

const handleErrorResponse = (res, error) => {
    console.error(error);
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    return res.status(status).json({
        ok: false,
        message,
        status
    });
}

export const createWorkspaceController = async (req, res) => {
    try {
        const { name, img, channels } = req.body;
        const { id } = req.user;

        //console.log("Datos recibidos:", { name, img, channels, userId: id });

        if (!name || !id) {
            return res.status(400).json({ ok: false, message: "Workspace name and user ID are required" });
        }

        // Verificamos si ya existe un workspace con el mismo nombre para el usuario
        const existingWorkspace = await WorkspaceRepository.getWorkspaceByNameAndOwner(name, id);
        if (existingWorkspace) {
            return res.status(400).json({ ok: false, message: "You already have a workspace with this name" });
        }

        const new_workspace = await WorkspaceRepository.createWorkspace({
            name,
            owner: id,
        });

        //console.log("Nuevo workspace creado:", new_workspace);

        const channelName = channels[0]?.name || 'General';

        const new_channel = await channelRepository.createChannel({
            name: channelName,
            workspace_id: new_workspace._id,
        });

        console.log("Nuevo canal creado:", new_channel);

        return res.status(201).json({
            ok: true,
            message: 'Workspace and channel created successfully',
            status: 201,
            data: {
                new_workspace,
                new_channel,
            },
        });
    } catch (error) {
        console.error("Error en createWorkspaceController:", error);
        handleErrorResponse(res, error);
    }
};



export const inviteUserToWorkspaceController = async (req, res) => {
    try {
        const { id } = req.user;
        const { workspace_id } = req.params;
        const { email } = req.body;

        const user_invited = await UserRepository.findUserByEmail(email);
        if (!user_invited) {
            throw new ServerError('User not found', 404);
        }

        const workspace_modified = await WorkspaceRepository.addMemberToWorkspace(workspace_id, id, user_invited._id);
        return res.status(201).json({
            ok: true,
            status: 201,
            message: 'User invited successfully',
            data: {
                workspace_selected: workspace_modified,
            },
        });
    } catch (error) {
        handleErrorResponse(res, error);
    }
};

export const getWorkspacesController = async (req, res) => {
    try {
        const { id } = req.user;
        const workspaces = await WorkspaceRepository.getAllWorkspacesByMemberId(id);

        for (let workspace of workspaces) {
            const channels = await channelRepository.getAllChannelsByWorkspaceId(workspace._id);
            workspace.channels = channels;  // Asocia los canales al workspace
        }

        return res.status(200).json({
            status: 200,
            ok: true,
            message: 'Workspaces retrieved successfully',
            data: {
                workspaces,
            },
        });
    } catch (error) {
        handleErrorResponse(res, error);
    }
};
