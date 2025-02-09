import pool from '../config/mysql.config.js'

// User table
const createUserTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            _id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(30) NOT NULL,
            username VARCHAR(30) NOT NULL,
            email VARCHAR(30) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            profilePicture VARCHAR(255),
            isVerified BOOLEAN DEFAULT FALSE,
            verificationToken VARCHAR(255),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            modifiedAt TIMESTAMP DEFAULT NULL
        );
    `
    await pool.query(query);
}

export default createUserTable