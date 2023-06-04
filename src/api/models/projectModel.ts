import mongoose, { Schema } from "mongoose";

const UserSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true }
});

export default mongoose.model('Project', UserSchema);