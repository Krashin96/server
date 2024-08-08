import { transporter } from "../config/nodemailer"

interface IUser {
    email: string
    name: string
    token: string
}

export class AuthMails {
    static sendConfirmationEmail = async ({ email, name, token }: IUser) => {

        await transporter.sendMail({
            from: 'UpTask <admin@uptask.com>',
            to: email,
            subject: 'UpTask - Confirma tu cuenta',
            text: 'UpTask - Confirma tu cuenta',
            html: `
                <p>Hola ${name} has creado tu cuenta en UpTask, solo debes confirmar tu cuenta</p>
                <p>Visita el siguiente enlace:</p>
                <a href='${process.env.FRONTEND_URL}/auth/confirm-account'>Confirmar cuenta</a>
                <p>Ingresa el código: <strong>${token}</strong></p>
                <p>Este código expirará en 10 minutos</p>
                `
        })
    }

    static sendResetPasswordRequest = async ({ email, name, token }: IUser) => {

        await transporter.sendMail({
            from: 'UpTask <admin@uptask.com>',
            to: email,
            subject: 'UpTask - Reestablece tu contraseña',
            text: 'UpTask - Reestablece tu contraseña',
            html: `
                <p>Hola ${name} has solicitado reestablece tu contraseña</p>
                <p>Visita el siguiente enlace:</p>
                <a href='${process.env.FRONTEND_URL}/auth/new-password'>Reestablecer contraseña</a>
                <p>Ingresa el código: <strong>${token}</strong></p>
                <p>Este código expirará en 10 minutos</p>
                `
        })
    }
}