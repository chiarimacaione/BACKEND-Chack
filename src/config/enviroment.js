
import dotenv from 'dotenv'

//Se cargan en la variable global process.env los valores del archivo .env
dotenv.config()

const ENVIROMENT = {
    PORT: process.env.PORT || 3000,
    SECRET_KEY_JWT: process.env.JWT_SECRET,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_USERNAME: process.env.EMAIL_USERNAME,
    URL_FRONTEND: process.env.URL_FRONTEND,
    URL_BACKEND: process.env.URL_BACKEND,
    MYSQL: {
        DB_HOST: process.env.DB_HOST,
        DB_USER: process.env.DB_USER,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_NAME: process.env.DB_NAME,
        DB_PORT: process.env.DB_PORT,
        DB_URI: process.env.DB_URI
    },
    CLOUDINARY: {
        CLD_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
        CLD_API_KEY: process.env.CLOUDINARY_API_KEY,
        CLD_API_SECRET: process.env.CLOUDINARY_API_SECRET
    }
}

export default ENVIROMENT