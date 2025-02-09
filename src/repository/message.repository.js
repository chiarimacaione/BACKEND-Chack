// message.repository.js
import pool from "../config/mysql.config.js";

class MessageRepository {
    // Obtener todos los mensajes de un canal
    async getAllMessagesFromChannel(channel_id) {
        try {
            const query = `
                SELECT 
                    messages._id,
                    messages.text,
                    messages.createdAt,
                    users.username AS author_username
                FROM messages
                JOIN users ON messages.author_id = users._id
                WHERE messages.channel_id = ?
                ORDER BY messages.createdAt ASC
            `;
            const [messages] = await pool.execute(query, [channel_id]);

            return messages;
        } catch (error) {
            console.error("Error al obtener los mensajes:", error);
            throw new Error("Error al obtener los mensajes.");
        }
    }

    // Crear un nuevo mensaje
    async createMessage({ text, author_id, channel_id }) {
        try {
            const query = `INSERT INTO messages (text, author_id, channel_id) VALUES (?, ?, ?)`;
            const [result] = await pool.execute(query, [text, author_id, channel_id]);

            return {
                _id: result.insertId,
                text,
                author_id,
                channel_id,
                createdAt: new Date().toISOString(),
            };
        } catch (error) {
            console.error("Error al crear el mensaje:", error);
            throw new Error("Error al crear el mensaje.");
        }
    }
}

export default new MessageRepository()