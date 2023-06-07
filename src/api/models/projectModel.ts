import mongoose, { Schema, Document, Types } from "mongoose";

export interface ProjectType extends Document {
    _id: Types.ObjectId;
    name: string;
    description: string;
    users: Types.ObjectId[];
    reports: Types.ObjectId[];
}

const ProjectSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    reports: [{ type: Schema.Types.ObjectId, ref: 'Report'}]
});

export default mongoose.model<ProjectType>('Project', ProjectSchema);