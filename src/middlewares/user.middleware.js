import jwt from 'jsonwebtoken';
import ENVIROMENT from '../config/enviroment.js';

export const userMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(' ')[1]; // Extraer el token
    jwt.verify(token, ENVIROMENT.SECRET_KEY_JWT, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token" });
        }
        req.user = decoded; // Almacenar usuario en req.user
        next();
    });
};
