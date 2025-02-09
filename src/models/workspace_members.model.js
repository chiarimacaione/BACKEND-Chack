import pool from '../config/mysql.config.js';

const createWorkspaceMembersTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS workspace_members (
            workspace_id INT NOT NULL,
            user_id INT NOT NULL,
            role VARCHAR(50) DEFAULT 'member',
            joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (workspace_id, user_id),
            FOREIGN KEY (workspace_id) REFERENCES workspaces(_id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(_id) ON DELETE CASCADE
        );
    `;
    await pool.query(query);
};

export default createWorkspaceMembersTable;
