import pool from '../config/mysql.config.js'
import messageModel from '../models/message.model.js';

export const createMessage = async (req, res) => {
    try {
        const { author_id, channel_id, text } = req.body;

        if (!author_id || !channel_id || !text) {
            return res.status(400).json({ message: 'Faltan datos requeridos' });
        }

        // Crear el mensaje en la base de datos
        const messageId = await messageModel.createMessage({ author_id, channel_id, text });

        // Obtener el mensaje recién creado con JOIN para incluir el autor y su foto de perfil
        const [newMessage] = await pool.query(`
            SELECT 
                messages._id, 
                messages.text, 
                messages.createdAt, 
                users.name AS author,
                users.profilePicture AS profilePicture
            FROM messages
            JOIN users ON messages.author_id = users._id
            WHERE messages._id = ?
        `, [messageId]);

        // Verificamos si el mensaje existe
        if (!newMessage || newMessage.length === 0) {
            return res.status(500).json({ message: 'Error al recuperar el mensaje creado' });
        }

        return res.status(201).json({
            ok: true,
            message: 'Mensaje creado correctamente',
            data: newMessage[0], // Aseguramos que enviamos el mensaje con toda la información
        });

    } catch (error) {
        console.error('Error al crear mensaje:', error);
        return res.status(500).json({ ok: false, message: 'Error al crear mensaje' });
    }
};

// Función para obtener los mensajes de un canal
export const getMessagesByChannel = async (req, res) => {
    try {
        const { channel_id } = req.params;

        // Realizamos un JOIN entre la tabla messages y users para obtener el nombre del autor
        const [messages] = await pool.query(`
            SELECT 
                messages._id, 
                messages.text, 
                messages.createdAt, 
                users.name AS author,
                users.profilePicture AS profilePicture
            FROM messages
            JOIN users ON messages.author_id = users._id
            WHERE messages.channel_id = ?
            ORDER BY messages.createdAt ASC
        `, [channel_id]);

        if (messages.length === 0) {
            return res.status(404).json({
                ok: false,
                message: 'No hay mensajes en este canal',
            });
        }

        // Devolvemos los mensajes con la estructura deseada
        res.status(200).json({
            ok: true,
            data: {
                messages,
            },
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            ok: false,
            message: 'Error fetching messages',
        });
    }
}