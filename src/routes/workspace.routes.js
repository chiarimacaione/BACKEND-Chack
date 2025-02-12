import express from 'express'
import { userMiddleware } from '../middlewares/user.middleware.js'
import { createWorkspaceController, getWorkspacesController, inviteUserToWorkspaceController } from '../controllers/workspace.controller.js'

const workspaceRoutes = express.Router()

workspaceRoutes.post("/", userMiddleware, createWorkspaceController)

workspaceRoutes.get('/', userMiddleware, getWorkspacesController)

workspaceRoutes.get('/:workspace_id', userMiddleware, async (req, res) => {
    const { workspace_id } = req.params;
    try {
        const workspace = await WorkspaceRepository.getWorkspaceById(workspace_id);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        return res.status(200).json({
            ok: true,
            message: 'Workspace retrieved successfully',
            data: { workspace }
        });
    } catch (error) {
        handleErrorResponse(res, error);
    }
});


workspaceRoutes.post('/:workspace_id/invite', userMiddleware, inviteUserToWorkspaceController);


export default workspaceRoutes