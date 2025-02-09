import pool from '../config/mysql.config.js';

const createWorkspaceTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS workspaces (
            _id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            owner INT NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (owner) REFERENCES users(_id) ON DELETE CASCADE
        );
    `;
    await pool.query(query);
};

export default createWorkspaceTable;
