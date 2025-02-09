import pool from "../config/mysql.config.js";

class ChannelRepository{
    async createChannel({name, workspace_id}){
        const query = `
        INSERT INTO channels (name, workspace_id)
        VALUES (?, ?)
        `
        const [result] = await pool.execute(query, [name, workspace_id])
        const [newChannel] = await pool.query(`
            SELECT * FROM channels WHERE _id = ?
        `, [result.insertId]);

        return newChannel[0];  // Retorna el canal con el _id recién creado
    } catch (error) {
        console.error('Error creating channel:', error);
        throw error;
    }

    async getAllChannelsByWorkspaceId (workspace_id){
        const query = `SELECT * FROM channels WHERE workspace_id = ?`
        const [channels] = await pool.execute(query, [workspace_id])
        return channels
    }

    async getChannelById (channel_id) {
        const query = `SELECT * FROM channels WHERE _id = ?`
        const [channels] = await pool.execute(query, [channel_id])
        return channels
    }
}

export default new ChannelRepository()