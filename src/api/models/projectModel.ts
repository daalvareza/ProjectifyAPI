import mongoose, { Schema } from "mongoose";

const ProjectSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    reports: [{ type: Schema.Types.ObjectId, ref: 'Report'}]
});

export default mongoose.model('Project', ProjectSchema);