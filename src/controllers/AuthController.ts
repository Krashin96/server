import { Request, Response } from 'express'
import { AuthMails } from '../emails/Authemails'
import { Token } from '../models/Token'
import { User } from '../models/User'
import { checkPassword, hashPassword } from '../utils/auth'
import { generateJWT } from '../utils/jwt'
import { generateToken } from '../utils/token'

export class AuthController {
    static createAccount = async (req: Request, res: Response) => {
        try {

            const { password, email, name } = req.body
            // Prevenir duplicados

            const userExists = await User.findOne({ email })
            if (userExists) {
                const error = new Error('El usuario ya posee una cuenta')
                res.status(409).json({ error: error.message })
                return
            }

            const user = new User(req.body)
            const token = new Token()

            // Hash password
            user.password = await hashPassword(password)


            // Generar Token
            token.user = user.id
            token.token = generateToken()

            // Enviar Email
            AuthMails.sendConfirmationEmail({ email, name, token: token.token })

            await Promise.allSettled([user.save(), token.save()])
            res.status(201).send('Cuenta Creada, revisa tu email para confirmarla')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            const tokenExists = await Token.findOne({ token })
            if (!tokenExists) {
                const error = new Error('Token no válido')
                res.status(404).json({ error: error.message })
                return
            }

            const user = await User.findById(tokenExists.user)
            user.confirmed = true

            await Promise.allSettled([tokenExists.deleteOne(), user.save()])
            res.send('Cuenta Confirmada')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const user = await User.findOne({ email })

            if (!user) {
                const error = new Error('Usuario no encontrado')
                res.status(404).json({ error: error.message })
                return
            }

            if (!user.confirmed) {

                // Generar Token
                const token = new Token()
                token.token = generateToken()
                token.user = user.id
                await token.save()

                // Enviar correo
                AuthMails.sendConfirmationEmail({ email: user.email, name: user.name, token: token.token })

                const error = new Error('Cuenta no confirmada, se ha enviado un código de confirmación a su correo')
                res.status(400).json({ error: error.message })
                return
            }

            const isPasswordCorrect = await checkPassword(password, user.password)

            if (!isPasswordCorrect) {
                const error = new Error('Contraseña incorrecta')
                res.status(401).json({ error: error.message })
                return
            }

            const jwt = generateJWT(user.id)
            res.send(jwt)

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const { email } = req.body
            const user = await User.findOne({ email })

            if (!user) {
                const error = new Error('Usuario no encontrado')
                res.status(404).json({ error: error.message })
                return
            }

            if (user.confirmed) {
                const error = new Error('La cuenta ya está confirmada')
                res.status(400).json({ error: error.message })
                return
            }

            // Generar Token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            await token.save()

            // Enviar correo
            AuthMails.sendConfirmationEmail({ email: user.email, name: user.name, token: token.token })

            res.send('Ha sido enviado un código a su correo')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body
            const user = await User.findOne({ email })

            if (!user) {
                const error = new Error('Usuario no encontrado')
                res.status(404).json({ error: error.message })
                return
            }

            // Generar Token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            await token.save()

            // Enviar correo
            AuthMails.sendResetPasswordRequest({ email: user.email, name: user.name, token: token.token })

            res.send('Revise su correo y siga las instrucciones')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static validatePasswordToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            const tokenExists = await Token.findOne({ token })
            if (!tokenExists) {
                const error = new Error('Token no válido')
                res.status(404).json({ error: error.message })
                return
            }

            res.send('Código Confirmado')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static resetPassword = async (req: Request, res: Response) => {
        try {
            const { token } = req.params
            const tokenExists = await Token.findOne({ token })
            if (!tokenExists) {
                const error = new Error('Token no válido')
                res.status(404).json({ error: error.message })
                return
            }

            const user = await User.findById(tokenExists.user)
            user.password = await hashPassword(req.body.password)

            Promise.allSettled([user.save(), tokenExists.deleteOne()])

            res.send('Contraseña modificada')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static user = async (req: Request, res: Response) => {
        res.json(req.user)
    }

    static updateProfile = async (req: Request, res: Response) => {
        const { email, name } = req.body
        const exists = await User.findOne({ email })

        if (exists && req.user.email !== exists.email.toString()) {
            const error = new Error('Correo no disponible')
            return res.status(409).json({ error: error.message })
        }

        req.user.email = email
        req.user.name = name

        try {
            await req.user.save()
            res.status(200).send('Perfil Actualizado')
        } catch (error) {
            return res.status(500).send('Hubo un error')
        }
    }

    static updateCurrentUserPassword = async (req: Request, res: Response) => {
        const { password, current_password } = req.body

        const user = await User.findById(req.user)

        const isValidPassword = await checkPassword(current_password, user.password)

        if (!isValidPassword) {
            const error = new Error('Contraseña actual incorrecta')
            return res.status(401).json({ error: error.message })
        }

        const newPassword = await hashPassword(password)

        try {
            user.password = newPassword
            await user.save()
            res.status(200).send('Contraseña Actualizada')
        } catch (error) {
            res.status(500).send('Hubo un error')
        }

    }

    static checkPassword = async (req: Request, res: Response) => {
        const { password } = req.body

        const user = await User.findById(req.user)

        const isValidPassword = await checkPassword(password, user.password)

        if (!isValidPassword) {
            const error = new Error('Contraseña incorrecta')
            return res.status(401).json({ error: error.message })
        }
        res.status(200).send('Contraseña Correcta')
    }
}