import { Request, Response, NextFunction } from 'express'
import { Project, TProject } from '../models/Project'

declare global {
    namespace Express {
        interface Request {
            project: TProject
        }
    }
}


export const projectExists = async (req: Request, res: Response, next: NextFunction) => {
    const { projectID } = req.params

    const project = await Project.findById(projectID)

    if (!project) {
        const error = new Error('Proyecto no encontrado')
        return res.status(404).json({ error: error.message })
    }

    req.project = project
    next()
}