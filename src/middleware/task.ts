import { NextFunction, Request, Response } from 'express'
import { TTask, Task } from '../models/Task'

declare global {
    namespace Express {
        interface Request {
            task: TTask
        }
    }
}


export const taskExists = async (req: Request, res: Response, next: NextFunction) => {
    const { taskID } = req.params

    const task = await Task.findById(taskID)

    if (!task) {
        const error = new Error('Tarea no encontrada')
        return res.status(404).json({ error: error.message })
    }

    if (task.project.toString() !== req.project.id) {
        const error = new Error('Acción no válida')
        return res.status(400).json({ error: error.message })
    }
    req.task = task
    next()
}

export const taskBelongToProject = async (req: Request, res: Response, next: NextFunction) => {
    if (req.task.project.toString() !== req.project.id.toString()) {
        const error = new Error('Accion no válida')
        return res.status(400).json({ error: error.message })
    }
    next()
}

export const hasAuthotization = async (req: Request, res: Response, next: NextFunction) => {
    if (req.user.id.toString() !== req.project.manager.toString()) {
        const error = new Error('Accion no válida')
        return res.status(400).json({ error: error.message })
    }
    next()
}