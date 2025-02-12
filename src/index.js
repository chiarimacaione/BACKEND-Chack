import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import ENVIROMENT from "./config/enviroment.js";
import path, { dirname } from "path";
import { fileURLToPath } from 'url';

// Rutas
import statusRoutes from './routes/status.routes.js';
import userRoutes from "./routes/user.routes.js";
import channelRoutes from './routes/channel.routes.js';
import workspaceRoutes from './routes/workspace.routes.js';
import messageRoutes from "./routes/message.routes.js";

// Conexión a la base de datos y modelos
import createUserTable from './models/user.model.js';
import createChannelTable from './models/channel.model.js';
import createWorkspaceTable from './models/workspace.model.js';
import createWorkspaceMembersTable from './models/workspace_members.model.js'
import messageModel from "./models/message.model.js";

// Configurar dotenv para cargar variables de entorno
dotenv.config();

const app = express();
const PORT = ENVIROMENT.PORT || 3000;

// Middlewares de seguridad
app.use(helmet()); // Protección de cabeceras HTTP
app.use(
    helmet({
        crossOriginResourcePolicy: false,
    })
);

// Configuración de CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", 'https://frontend-chack.vercel.app');
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Access-Control-Allow-Origin");
    res.header("Access-Control-Allow-Credentials", "true"); // 👈 Importante si usas cookies
    next();
});


app.options('*', cors()); // Habilitar preflight para todas las rutas


app.use(express.json()); // Para leer el cuerpo de las peticiones en formato JSON

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Servir los archivos estáticos de la carpeta 'uploads'
app.use('/src/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, path) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); // Permite compartir imágenes con el frontend
        res.setHeader('Content-Type', 'image/jpeg'); // Asegura que se sirvan como imágenes
    }
}));


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
    console.log(`Accede al servidor en: ${ENVIROMENT.URL_FRONTEND}`);
})


