import { profile } from "console";
import pool from "../config/mysql.config.js";

class UserRepository{
    async createUser  ({ name, username, email, profilePicture, password, verificationToken }) {
        try {
            const [rows] = await pool.execute(
                `INSERT INTO users (name, username, email, profilePicture, password, verificationToken) 
                VALUES (?, ?, ?, ?, ?, ?)`, 
                [name || null, username || null, email || null, profilePicture || null, password || null, verificationToken]
            );
            return rows;
        } catch (error) {
            console.error('Error al crear usuario:', error);
            throw error; // Propaga el error para ser manejado en el controlador
        }
    };

    async findUserByEmail (email){
        const query = `SELECT * FROM users WHERE email = ?`
        const [result] = await pool.execute(query, [email])
        return result[0] || null
    }
    async findById(id){
        const query = `SELECT * FROM users WHERE _id = ?`
        const [result] = await pool.execute(query, [id])
        return result[0] || null
    }

    async verifyUser( user_id ){
        const query = `
        UPDATE users
        SET isVerified = 1
        WHERE _id = ?
        `
        await pool.execute(query, [user_id])
    }
}

export default new UserRepository()