import mongoose, { Document, Schema, Types } from "mongoose";

export interface INote extends Document {
    content: string
    createdBy: Types.ObjectId
    task: Types.ObjectId
}

export const NoteSchema: Schema = new Schema({
    content: {
        type: String,
        required: true
    },
    createdBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    task: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true })

export const Note = mongoose.model<INote>('Note', NoteSchema)