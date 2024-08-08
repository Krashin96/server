import mongoose, { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { Note } from "./Note";
import { Task, TTask } from "./Task";
import { IUser } from "./User";

export type TProject = Document & {
    projectName: string
    clientName: string
    description: string
    tasks: PopulatedDoc<TTask & Document>[]
    manager: PopulatedDoc<IUser & Document>
    team: PopulatedDoc<IUser & Document>[]
}

export const ProjectSchema: Schema = new Schema({
    projectName: {
        type: String,
        require: true,
        trim: true
    },
    clientName: {
        type: String,
        require: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    tasks: [
        {
            type: Types.ObjectId,
            ref: 'Task'

        }
    ],
    manager: {
        type: Types.ObjectId,
        ref: 'User'

    },
    team: [
        {
            type: Types.ObjectId,
            ref: 'User'

        }
    ],
}, { timestamps: true })

ProjectSchema.pre('deleteOne', { document: true }, async function () {
    const projectID = this.id
    if (!projectID) return

    const tasks = await Task.find({ project: projectID })
    for (const task of tasks) {
        await Note.deleteMany({ task: task.id })
    }
    await Task.deleteMany({ project: projectID })
})

export const Project = mongoose.model<TProject>('Project', ProjectSchema)