import express from 'express'
import { registerController, loginController, verifyEmailController, profileController } from '../controllers/user.controller.js';
import verifyToken from '../middlewares/verifyToken.middleware.js';
import upload from '../config/multer.config.js';

const userRoutes = express.Router()

userRoutes.post('/register', upload.single('profilePicture'),registerController)
userRoutes.post('/login', loginController)
userRoutes.get('/verify-email', verifyEmailController)
userRoutes.get('/profile', verifyToken, profileController)

export default userRoutes