import type { Request, Response } from 'express'
import { Project } from '../models/Project'
export class ProjectController {

    static createProject = async (req: Request, res: Response) => {
        const project = new Project(req.body)

        project.manager = req.user.id

        try {
            await project.save()
            res.status(201).send('Proyecto Creado')
        } catch (error) {
            console.log(error)
        }
    }

    static getAllProjects = async (req: Request, res: Response) => {
        try {
            const projects = await Project.find({
                $or: [
                    { manager: { $in: req.user.id } },
                    { team: { $in: req.user.id } }
                ]
            })
            res.status(200).json(projects)

        } catch (error) {
            console.log(error)
        }
    }

    static getProjectByID = async (req: Request, res: Response) => {
        try {
            const project = await req.project.populate('tasks')

            req.user.id.toString() !== project.manager.toString() && !project.team.includes(req.user.id)
                ? res.status(404).json({ error: 'Proyecto no encontrado' })
                : res.status(200).json(project)

        } catch (error) {
            console.log(error)
        }
    }

    static deleteProject = async (req: Request, res: Response) => {
        try {
            req.user.id.toString() !== req.project.manager.toString()
                ? res.status(500).json({ error: 'Solo el manager puede eliminar este proyecto' })
                : await req.project.deleteOne() && res.status(200).send('Proyecto Eliminado')

        } catch (error) {
            console.log(error.message)
        }
    }


    static updateProject = async (req: Request, res: Response) => {
        try {

            if (req.user.id.toString() !== req.project.manager.toString()) {
                return res.status(404).json({ error: 'Solo el manager puede actualizar este proyecto' })
            } else {
                req.project.projectName = req.body.projectName
                req.project.clientName = req.body.clientName
                req.project.description = req.body.description
                await req.project.save()
                res.status(200).send('Proyecto Actulizado')
            }
        } catch (error) {
            console.log(error)
        }
    }
}