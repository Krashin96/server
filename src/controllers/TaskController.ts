import { Request, Response } from 'express'
import { Task, TTask } from '../models/Task'

export class TaskController {
    static createTask = async (req: Request, res: Response) => {

        const { project } = req
        try {

            const task = new Task(req.body)
            task.project = project.id
            project.tasks.push(task.id)
            await Promise.allSettled([task.save(), project.save()])
            res.status(201).send('Tarea Creada')


        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static getAllTasks = async (req: Request, res: Response) => {

        try {
            const tasksArray = await Task.find({ project: req.project.id }).populate('project')

            res.status(200).json(tasksArray)

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static getTaskByID = async (req: Request, res: Response) => {
        try {
            const task = await Task.findById(req.task.id)
                .populate({ path: 'completedBy.user', select: 'id name email' })
                .populate({ path: 'notes', populate: { path: 'createdBy', select: 'id name email' } })

            res.status(200).json(task)

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static updateTask = async (req: Request, res: Response) => {

        try {
            req.task.name = req.body.name
            req.task.description = req.body.description

            await req.task.save()

            res.status(200).send('Tarea Actualizada')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static deleteTask = async (req: Request, res: Response) => {

        try {
            req.project.tasks = req.project.tasks.filter(element => element.toString() !== req.params.taskID)

            await Promise.allSettled([req.task.deleteOne(), req.project.save()])

            res.status(200).send('Tarea Eliminada')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static updateStatus = async (req: Request, res: Response) => {
        const { status } = req.body

        const data: TTask['completedBy'][0] = { user: req.user.id, status }

        try {
            req.task.completedBy.push(data)
            req.task.status = status

            await req.task.save()

        } catch (error) {
            console.log(error)
        }

        res.status(200).send('Tarea Actualizado')

    }
}