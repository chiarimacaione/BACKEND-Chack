import ENVIROMENT from './enviroment.js'
import mysql from 'mysql2/promise'

const pool = mysql.createPool({
    host: ENVIROMENT.MYSQL.DB_HOST,
    user: ENVIROMENT.MYSQL.DB_USER,
    password: ENVIROMENT.MYSQL.DB_PASSWORD,
    database: ENVIROMENT.MYSQL.DB_NAME,
    port: ENVIROMENT.MYSQL.DB_PORT,
    connectionLimit: 10,
    connectTimeout: 20000,
});

(async () => {
    try {
        await pool.getConnection();
        console.log('Connected to Clever Cloud MySQL');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1); // Salir si la conexión falla
    }
})();

export default pool