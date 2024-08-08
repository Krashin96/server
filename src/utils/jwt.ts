import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

export function generateJWT(payload: Types.ObjectId) {
    const token = jwt.sign({ payload }, process.env.JWT_PASS, {
        expiresIn: '180d'
    })
    return token
}