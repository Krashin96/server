import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import morgan from 'morgan'
import { corsConfig } from './config/cors'
import { connectDB } from './config/db'
import { authRoutes } from './routes/authRoutes'
import { projectRoutes } from './routes/projectRoutes'

// Habilitar lectura de variables de entorno
dotenv.config()

// Conectar a la Base de Datos
connectDB()

// Instancia del server
export const server = express()

// Monitorear logs en el server
server.use(morgan('dev'))

// Habilitar CORS
server.use(cors(corsConfig))

// Habilitar lectura de json
server.use(express.json())

server.use('/api/projects', projectRoutes)
server.use('/api/auth', authRoutes)
