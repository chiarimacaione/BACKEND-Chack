import pool from '../config/mysql.config.js';

const createChannelTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS channels (
            _id INT AUTO_INCREMENT PRIMARY KEY,
            workspace_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (workspace_id) REFERENCES workspaces(_id) ON DELETE CASCADE
        );
    `;
    await pool.query(query);
};

export default createChannelTable;
