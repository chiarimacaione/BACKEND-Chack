import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import ENVIROMENT from "./src/config/enviroment.js";
import path, { dirname } from "path";
import { fileURLToPath } from 'url';

// Rutas
import statusRoutes from './src/routes/status.routes.js';
import userRoutes from "./src/routes/user.routes.js";
import channelRoutes from './src/routes/channel.routes.js';
import workspaceRoutes from './src/routes/workspace.routes.js';
import messageRoutes from "./src/routes/message.routes.js";

// Conexión a la base de datos y modelos
import createUserTable from './src/models/user.model.js';
import createChannelTable from './src/models/channel.model.js';
import createWorkspaceTable from './src/models/workspace.model.js';
import createMessageTable from './src/models/message.model.js';
import createWorkspaceMembersTable from './src/models/workspace_members.model.js'
import messageModel from "./src/models/message.model.js";

// Configurar dotenv para cargar variables de entorno
dotenv.config();

const app = express();
const PORT = ENVIROMENT.PORT || 3000;

// Middlewares de seguridad
app.use(helmet()); // Protección de cabeceras HTTP

// Configuración de CORS
app.use(
    cors({
        origin: ENVIROMENT.URL_FRONTEND || 'http://localhost:5173',
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    })
);


app.use(express.json()); // Para leer el cuerpo de las peticiones en formato JSON

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Servir los archivos estáticos de la carpeta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Limitador de peticiones para evitar ataques de fuerza bruta
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Máximo de 100 peticiones por IP
    message: "Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde.",
});
app.use(limiter)

// Rutas
app.use("/status", statusRoutes)
app.use("/users", userRoutes)
app.use("/workspaces", workspaceRoutes)
app.use("/channels", channelRoutes)
app.use("/api/messages", messageRoutes)

// Conectar y crear las tablas en la base de datos
// Función para inicializar la base de datos
const initializeDatabase = async () => {
    try {
        // Crear las tablas sin dependencias primero
        await createUserTable()
        await createWorkspaceTable()

        // Luego crear las tablas que dependen de las anteriores
        await createChannelTable()
        messageModel.createMessageTable()
        await createWorkspaceMembersTable()

        console.log("Tablas creadas o verificadas correctamente");
    } catch (error) {
        console.error("Error al crear las tablas:", error);
    }
};


// Inicializar la base de datos al arrancar el servidor
initializeDatabase();

// Manejo de errores no controlados
app.use((req, res, next) => {
    const error = new Error("Ruta no encontrada");
    error.status = 404;
    next(error);
});

// Middleware para manejar errores globales
app.use((error, req, res, next) => {
    console.error(error);
    const status = error.status || 500;
    res.status(status).json({
        ok: false,
        message: error.message || "Error interno del servidor",
        status,
    });
});


app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`Accede al servidor en: http://localhost:${PORT}`);
})


