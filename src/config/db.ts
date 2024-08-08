import colors from 'colors'
import mongoose, { connection } from 'mongoose'
import {exit} from 'node:process'

export const connectDB = async () => {
    try {
        const {connection} = await mongoose.connect(process.env.DATABASE_URL)
        const url = `${connection.host}:${connection.port}`
        console.log(colors.magenta.bold(`MongoDB conectado en: ${url}`))
    } catch (error) {
        console.log(colors.red.bgWhite('Fallo al conectar a MondoDB'))
        exit(1)
    }
}