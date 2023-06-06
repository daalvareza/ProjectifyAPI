import mongoose, { Schema } from "mongoose";

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    reports: [{ type: Schema.Types.ObjectId, ref: 'Report' }]
});

export default mongoose.model('User', UserSchema);