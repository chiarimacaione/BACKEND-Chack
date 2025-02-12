import { validateEmail, validatePassword } from '../utils/validator.utils.js';
import sendMail from '../utils/sendMail.utils.js'
import UserRepository from '../repository/user.repository.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import ENVIROMENT from '../config/enviroment.js'

const QUERY = {
    VERIFICATION_TOKEN: 'verification_token'
}

// Register a new user
export const createUser = async ({ username, email, password, verificationToken }) => {
    const nuevo_usuario = new User({
        username,
        email,
        password,
        verificationToken,
        modifiedAt: null
    })
    return nuevo_usuario.save()
}

// Find by email
export const findUserByEmail = async (email) => {
    const userFound = await User.findOne({ email: email })
    return userFound
}

// Login a user
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await findUserByEmail(email)
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' })
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' })
        res.status(200).json({ message: 'Login successful', token })
    } catch (error) {
        res.status(500).json({ message: 'Server error', error })
    }
};


export const registerController = async (req, res) => {
    try {
        console.log('Registro iniciado', req.body);
        const { username, email, password, name } = req.body;

        // Verifica si la foto fue cargada y si no, asigna null
        const profilePicture = req.file ? req.file.path : null;

        // Validación de campos obligatorios
        if (!username || !email || !password || !name) {
            return res.json({
                ok: false,
                status: 400,
                message: 'All fields are required.',
            });
        }


        if (!validateEmail(email)) {
            return res.status(400).json({
                ok: false,
                message: 'Invalid email format.',
            });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({
                ok: false,
                message: "Password must be at least 8 characters long."
            });
        }
        

        const user_found = await UserRepository.findUserByEmail(email);

        if (user_found) {
            return res.status(400).json({
                ok: false,
                message: 'A user with this email already exists.',
            });
            
        }

        // Si la foto no fue cargada o hay un problema, profilePicture será null
        const profilePictureUrl = profilePicture || null;
        const verificationToken = jwt.sign({ email }, ENVIROMENT.SECRET_KEY_JWT, { expiresIn: '1d' });

        await sendMail({
            to: email,
            subject: 'Validate your email to continue on Chack!',
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f4f7fc; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color:rgb(78, 43, 97);">Welcome to Chack!</h1>
                        <p style="font-size: 18px; color: #333333;">We’re excited to have you on board! Please confirm your email address to get started.</p>
                    </div>
                    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);">
                        <p style="font-size: 16px; color: #555555;">To continue using Chack, click the button below to verify your email address:</p>
                        <div style="text-align: center; margin-top: 20px;">
                            <a href="https://backend-chack.vercel.app/users/verify-email?${QUERY.VERIFICATION_TOKEN}=${verificationToken}" 
                                style="background-color:rgb(109, 52, 145); color: white; padding: 15px 30px; font-size: 16px; border-radius: 5px; text-decoration: none; font-weight: bold;">
                                Verify Email
                            </a>
                        </div>
                        <p style="font-size: 14px; color: #777777; margin-top: 20px; text-align: center;">If you didn't sign up for Chack, please ignore this email.</p>
                    </div>
                </div>
            `,
        });


        const password_hash = await bcrypt.hash(password, 10);
        const newUser = await UserRepository.createUser({
            name,
            username,
            email,
            profilePicture,
            password: password_hash,
            verificationToken: verificationToken
        });


        return res.json({
            ok: true,
            status: 201,
            message: 'User registered successfully',
            data: {
                name: newUser.name,
                username: newUser.username,
                email: newUser.email,
                profilePicture: newUser.profilePicture,
            },
        });
    } catch (error) {
        console.error(error);
        res.json({
            ok: false,
            status: 500,
            message: 'Server error',
        });
    }
};


/* el usuario se registra → se envía un correo con el verificationToken → el usuario hace clic en el enlace para verificar → se elimina el verificationToken → el usuario inicia sesión → se genera el access_token. */

export const verifyEmailController = async (req, res) => {
    try {
        const { [QUERY.VERIFICATION_TOKEN]: verification_token } = req.query
        if (!verification_token) {
            return res.redirect(`${ENVIROMENT.URL_FRONTEND}/error?error=REQUEST_EMAIL_VERIFY_TOKEN`)

        }
        const payload = jwt.verify(verification_token, ENVIROMENT.SECRET_KEY_JWT)
        const user_to_verify = await UserRepository.findUserByEmail(payload.email)
        if (!user_to_verify) {
            return res.redirect(`${ENVIROMENT.URL_FRONTEND}/error?error=REQUEST_EMAIL_VERIFY_TOKEN`)
        }
        if (user_to_verify.verificationToken !== verification_token) {
            return res.redirect(`${ENVIROMENT.URL_FRONTEND}/error?error=RESEND_VERIFY_TOKEN`)
        }
        await UserRepository.verifyUser(user_to_verify._id)
        return res.redirect(`${ENVIROMENT.URL_FRONTEND}/login?verified=true`)
    }
    catch (error) {
        console.log(error)
        res.json({
            status: 500,
            message: "Internal server error",
            ok: false
        })
    }
}
export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        const errors = {
            email: null,
            password: null,
        };

        if (!email || !(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(email))) {
            errors.email = "You must enter a valid value for email.";
        }

        if (!password) {
            errors.password = "You must enter a password.";
        }

        let hayErrores = false;
        for (let error in errors) {
            if (errors[error]) {
                hayErrores = true;
            }
        }

        if (hayErrores) {
            return res.json({
                message: "Errors exist!",
                ok: false,
                status: 400, //bad request
                errors: errors,
            });
        }

        const user_found = await UserRepository.findUserByEmail(email);
        if (!user_found) {
            return res.json({
                ok: false,
                status: 404,
                message: "There is no user with this email.",
            });
        }

        const is_same_password = await bcrypt.compare(password, user_found.password);
        if (!is_same_password) {
            return res.json({
                ok: false,
                status: 400,
                message: "Wrong password. Please try again.",
            });
        }

        // Verificar si el correo está verificado
        if (!user_found.isVerified) {
            return res.json({
                ok: false,
                status: 403, // Forbidden
                message: "Your email has not been verified. Please verify your email first.",
            });
        }

        // Crear el token
        const user_info = {
            id: user_found._id,
            name: user_found.name,
            username: user_found.username,
            email: user_found.email,
            profilePicture: user_found.profilePicture
        };

        const access_token = jwt.sign(user_info, ENVIROMENT.SECRET_KEY_JWT);

        return res.json({
            ok: true,
            status: 200,
            message: "Logged in",
            data: {
                user_info,
                access_token,
            },
        });
    } catch (error) {
        console.error(error);
        return res.json({
            ok: false,
            message: "Internal server error",
            status: 500,
        });
    }
};


// Ruta protegida para obtener el perfil del usuario
export const profileController = (req, res) => {
    res.json({
        user: {
            name: req.user.name,
            email: req.user.email,
            username: req.user.username,
            profilePicture: req.user.profilePicture
        },
    });
    console.log(req.user);
};




