import WorkspaceRepository from "../repository/workspace.repository.js";
import channelRepository from "../repository/channel.repository.js";
import jwt from 'jsonwebtoken';
import ENVIROMENT from '../config/enviroment.js';
import pool from '../config/mysql.config.js';

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
            return res.status(400).json({
                ok: false,
                message: "You already have a workspace with this name"
            });
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

export const inviteUserToWorkspaceController = async (req, res) => {
    const { workspace_id } = req.params;
    const { email } = req.body;  // Recibimos el correo del body de la solicitud

    //console.log('Request Body:', req.body);  // Verifica los datos recibidos en el backend

    // Verificar que el correo tiene un formato válido
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email' });
    }

    // Verificar que el usuario es el dueño del workspace
    const [workspace] = await pool.query('SELECT * FROM workspaces WHERE _id = ? AND owner = ?', [workspace_id, req.user.id]);

    if (!workspace) {
        return res.status(403).json({ message: 'You do not have permission to add users to this workspace.' });
    }

    //console.log('Workspace found:', workspace);  // Verifica si se encuentra el workspace

    // Verificar si el usuario existe
    const [user] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    //console.log('User found:', user);

    if (!user || user.length === 0) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Acceder correctamente al id
    const userId = user[0]._id;  // Si user es un arreglo, usa el primer elemento

    //console.log('User ID:', userId);

    const [existingMember] = await pool.query('SELECT * FROM workspace_members WHERE workspace_id = ? AND user_id = ?', [workspace_id, userId]);

    if (existingMember.length > 0) {
        //console.log('User already a member:', existingMember);  // Verifica si el usuario ya es miembro
        return res.status(400).json({ message: 'The user is already a member of the workspace.' });
    }

    // Agregar al usuario como miembro del workspace
    await pool.query('INSERT INTO workspace_members (workspace_id, user_id) VALUES (?, ?)', [workspace_id, userId]);

    return res.json({ message: 'User successfully added to the workspace' });
}