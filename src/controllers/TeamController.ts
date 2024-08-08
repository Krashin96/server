import type { Request, Response } from 'express'
import { User } from '../models/User'

export class TeamController {
    static findMemberByEmail = async (req: Request, res: Response) => {
        const { email } = req.body

        const user = await User.findOne({ email }).select('id name email')

        if (!user) {
            const error = new Error('Usuario no encontrado')
            return res.status(404).json({ error: error.message })
        }

        res.json(user)
    }

    static addMemberByID = async (req: Request, res: Response) => {
        const { id } = req.body
        const { project } = req

        const user = await User.findById(id).select('id')

        if (!user) {
            const error = new Error('Usuario no encontrado')
            return res.status(404).json({ error: error.message })
        }

        if (project.team.some(member => member.toString() === user.id.toString())) {
            const error = new Error('Este Usuario ya está en el equipo')
            return res.status(500).json({ error: error.message })
        }
        project.team.push(user.id)
        await project.save()
        res.status(200).send('Miembro agregado')
    }

    static deleteMember = async (req: Request, res: Response) => {
        const { userID } = req.params
        const { project } = req

        if (!project.team.some(member => member.toString() === userID.toString())) {
            const error = new Error('Este Usuario no está en el equipo')
            return res.status(500).json({ error: error.message })
        }
        project.team = project.team.filter(member => member.toString() !== userID.toString())
        await project.save()
        res.status(200).send('Miembro Eliminado')
    }

    static getMembers = async (req: Request, res: Response) => {
        const project = await req.project.populate({ path: 'team', select: 'id name email' })

        if (!project.team.length) return res.send('No hay miembros en tu equipo aún')

        res.status(200).json(project.team)
    }
}