import { Router } from "express";
import { body } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { autenticate } from "../middleware/auth";
import { handleInputErrors } from "../middleware/validation";

export const authRoutes = Router()

authRoutes.post('/create-account',
    body('name').notEmpty().withMessage('El nombre no puede estar vacío'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener mínimo 8 caracteres'),
    body('password_confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Las contraseñas no coinciden')
        }
        return true
    }),
    body('email').isEmail().withMessage('Email no válido'),
    handleInputErrors,
    AuthController.createAccount
)

authRoutes.post('/confirm-account',
    body('token').notEmpty().withMessage('El token no puede estar vacío'),
    handleInputErrors,
    AuthController.confirmAccount
)

authRoutes.post('/login',
    body('email').notEmpty().withMessage('El Email no puede estar vacío'),
    body('password').notEmpty().withMessage('La contraseña no puede estar vacía'),
    handleInputErrors,
    AuthController.login
)

authRoutes.post('/request-code',
    body('email').notEmpty().withMessage('El Email no puede estar vacío'),
    handleInputErrors,
    AuthController.requestConfirmationCode
)

authRoutes.post('/forgot-password',
    body('email').notEmpty().withMessage('El Email no puede estar vacío'),
    handleInputErrors,
    AuthController.forgotPassword
)

authRoutes.post('/validate-password-token',
    body('token').notEmpty().withMessage('El token no puede estar vacío'),
    handleInputErrors,
    AuthController.validatePasswordToken
)

authRoutes.post('/reset-password/:token',
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener mínimo 8 caracteres'),
    body('password_confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Las contraseñas no coinciden')
        }
        return true
    }),
    handleInputErrors,
    AuthController.resetPassword
)

authRoutes.get('/user',
    autenticate,
    AuthController.user
)

authRoutes.put('/profile',
    autenticate,
    body('name').notEmpty().withMessage('El nombre no puede estar vacío'),
    body('email').isEmail().withMessage('Email no válido'),
    handleInputErrors,
    AuthController.updateProfile
)

authRoutes.post('/update-password',
    autenticate,
    body('current_password').notEmpty().withMessage('La contraseña actual no puede estar vacía'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener mínimo 8 caracteres'),
    body('password_confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Las contraseñas no coinciden')
        }
        return true
    }),
    handleInputErrors,
    AuthController.updateCurrentUserPassword
)

authRoutes.post('/check-password',
    autenticate,
    body('password').notEmpty().withMessage('La contraseña no puede estar vacía'),
    handleInputErrors,
    AuthController.checkPassword
)