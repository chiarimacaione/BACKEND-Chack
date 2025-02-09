import jwt from 'jsonwebtoken';
import ENVIROMENT from '../config/enviroment.js';

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Obtener el token del header Authorization
    
    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    jwt.verify(token, ENVIROMENT.SECRET_KEY_JWT, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido' });
        }

        req.user = decoded; // Guardamos la información del usuario decodificada en la solicitud
        next();
    });
}

export default verifyToken