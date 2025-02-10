import pool from "../config/mysql.config.js";
import { ServerError } from "../utils/errors.utils.js";

class WorkspaceRepository {

    async createWorkspace({ name, owner: id }) {
        if (!name || !id) {
            throw new ServerError("Workspace name and user ID are required", 400);
        }
    
        try {
            // Verificar si ya existe un workspace con el mismo nombre y propietario
            const checkQuery = `SELECT COUNT(*) AS count FROM workspaces WHERE name = ? AND owner = ?`;
            const [rows] = await pool.execute(checkQuery, [name, id]);
    
            if (rows[0].count > 0) {
                throw new ServerError("Ya tienes un workspace con este nombre", 400);
            }
    
            // Insertar el nuevo workspace
            const query = `INSERT INTO workspaces (name, owner) VALUES (?, ?)`;
            const [result] = await pool.execute(query, [name, id]);
    
            // Insertar al creador del workspace como "owner" en workspace_members
            const queryInsertMember = `INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, ?)`;
            await pool.execute(queryInsertMember, [result.insertId, id, "owner"]);
    
            return { _id: result.insertId, name, id };
        }
        catch (error) {
            console.error("Error creating workspace:", error.message, error.stack);
            throw new ServerError(error.message || "Failed to create workspace", 500);
        }
    
        }

        async getWorkspaceByNameAndOwner(name, ownerId) {
            const query = `SELECT * FROM workspaces WHERE name = ? AND owner = ?`;
            const [rows] = await pool.execute(query, [name, ownerId]);
            return rows.length > 0 ? rows[0] : null;
        }
        
    async findWorkspaceById(workspace_id) {
        if (!workspace_id) {
            throw new ServerError("Workspace ID is required", 400);
        }

        const querySelectWorkspace = `SELECT * FROM workspaces WHERE _id = ?`;
        const [result] = await pool.execute(querySelectWorkspace, [workspace_id]);
        return result[0] || null;
    }

    async addMemberToWorkspace(workspace_id, user_id, user_invited_id) {
        const workspace = await this.findWorkspaceById(workspace_id);
        if (!workspace) {
            throw new ServerError('Workspace not found', 404);
        }
        if (workspace.owner !== user_id) {
            throw new ServerError('User is not the owner', 403);
        }

        const queryExistingMember = `
            SELECT * FROM workspace_members
            WHERE workspace_id = ? AND user_id = ?
        `;
        const [members_found] = await pool.execute(queryExistingMember, [workspace_id, user_invited_id]);
        if (members_found.length > 0) {
            throw new ServerError('User already is a member', 400);
        }

        const insertMemberQuery = `INSERT INTO workspace_members (workspace_id, user_id) VALUES (?, ?)`;
        await pool.execute(insertMemberQuery, [workspace_id, user_invited_id]);

        return workspace;
    }

    async getAllWorkspacesByMemberId(user_id) {
        if (!user_id) {
            throw new ServerError("User ID is required", 400);
        }

        const selectWorkspacesQuery = `
            SELECT
                workspaces._id AS workspace_id,
                workspaces.name AS workspace_name,
                users.username AS owner_username,
                users.email AS owner_email
            FROM workspaces
            JOIN users ON workspaces.owner = users._id
            JOIN workspace_members ON workspace_members.workspace_id = workspaces._id
            WHERE workspace_members.user_id = ?
        `;
        const [workspaces] = await pool.execute(selectWorkspacesQuery, [user_id]);

        return workspaces.map((workspace) => {
            return {
                _id: workspace.workspace_id,
                name: workspace.workspace_name,
                owner: {
                    username: workspace.owner_username,
                    email: workspace.owner_email,
                }
            }
        })
    }

    async isUserMemberOfWorkspace(user_id, workspace_id) {
        if (!user_id || !workspace_id) {
            throw new ServerError("User ID and workspace ID are required", 400)
        }

        const query = `SELECT * FROM workspace_members WHERE user_id = ? AND workspace_id = ?`
        const [result] = await pool.execute(query, [user_id, workspace_id])
        return Boolean(result.length)
    }
}

export default new WorkspaceRepository()