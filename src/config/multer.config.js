import multer from 'multer';
import path from 'path';

// Configuración de Multer para guardar la imagen en un directorio 'uploads'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/src/uploads/'); // El directorio donde se almacenarán las fotos
    },
    filename: (req, file, cb) => {
        // Generar un nombre único para cada archivo (timestamp + extensión original)
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Exportar la función para su uso en las rutas
export default upload;
