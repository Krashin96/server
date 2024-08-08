import { Request, Response } from 'express'
import { INote, Note } from '../models/Note'

export class NoteController {
    static createNote = async (req: Request<{}, {}, INote>, res: Response) => {
        const note = new Note()
        note.content = req.body.content
        note.createdBy = req.user.id
        note.task = req.task.id

        req.task.notes.push(note.id)
        try {
            await Promise.allSettled([note.save(), req.task.save()])
            res.send('Nota Creada')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static getTaskNotes = async (req: Request, res: Response) => {
        try {
            const notes = await Note.find({ task: req.task.id })
            res.status(200).json(notes)
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static deleteNote = async (req: Request, res: Response) => {
        try {
            const note = await Note.findById(req.params.noteID)

            if (!note) {
                const error = new Error('Nota no encontrada')
                return res.status(404).json({ error: error.message })
            }

            if (note.createdBy.toString() !== req.user.id.toString()) {
                const error = new Error('Acción no válida')
                return res.status(401).json({ error: error.message })
            }

            req.task.notes = req.task.notes.filter(note => note.toString() !== req.params.noteID.toString())

            await Promise.allSettled([req.task.save(), note.deleteOne()])
            res.send('Nota eliminada')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }
}