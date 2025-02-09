import pool from '../config/mysql.config.js';

// Crear la tabla de mensajes si no existe
const createMessageTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS messages (
            _id INT AUTO_INCREMENT PRIMARY KEY,
            text TEXT NOT NULL,
            channel_id INT NOT NULL,
            author_id INT NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (channel_id) REFERENCES channels(_id) ON DELETE CASCADE,
            FOREIGN KEY (author_id) REFERENCES users(_id) ON DELETE CASCADE
        );
    `;
    await pool.query(query);
};

// Función para crear un mensaje
const createMessage = async (messageData) => {
    const { text, channel_id, author_id } = messageData;
    
    const query = `
        INSERT INTO messages (text, channel_id, author_id)
        VALUES (?, ?, ?);
    `;
    
    const values = [text, channel_id, author_id];
    
    try {
        const [result] = await pool.query(query, values);
        return result.insertId; // Devuelve el ID del mensaje creado
    } catch (error) {
        console.error('Error al insertar mensaje:', error);
        throw new Error('Error al insertar mensaje en la base de datos');
    }
}

export default {createMessageTable, createMessage};