import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
import ENVIROMENT from './enviroment.js';

dotenv.config();

// Configuración de Cloudinary
cloudinary.config({
    cloud_name: ENVIROMENT.CLOUDINARY.CLD_CLOUD_NAME,
    api_key: ENVIROMENT.CLOUDINARY.CLD_API_KEY,
    api_secret: ENVIROMENT.CLOUDINARY.CLD_API_SECRET
});


// Configuración de Multer para usar Cloudinary
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'chack-profile-pictures', // Carpeta donde se guardarán las imágenes en Cloudinary
        format: async (req, file) => 'png', // Formato de imagen
        public_id: (req, file) => Date.now() + '-' + file.originalname, // Nombre único
    },
});

const upload = multer({ storage, limits: { fileSize: 1024 * 1024 * 5 } });

export default upload;
