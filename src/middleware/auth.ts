import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { IUser, User } from '../models/User'

declare global {
    namespace Express {
        interface Request {
            user?: IUser
        }
    }
}

export async function autenticate(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
        const error = new Error('No autorizado')
        return res.status(401).json({ error: error.message })
    }

    const token = req.headers.authorization.split(' ')[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_PASS)

        if (typeof decoded === 'object' && decoded.payload) {
            const user = await User.findById(decoded.payload).select('id name email')

            if (!user) {
                return res.status(500).json({ error: 'Token no válido' })
            }

            req.user = user
            next()
        }

    } catch (error) {
        return res.status(500).json({ error: 'Token no válido' })
    }


}