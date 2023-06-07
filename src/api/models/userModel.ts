import mongoose, { Schema, Document, Types } from "mongoose";

export interface UserType extends Document {
    _id: Types.ObjectId;
    username: string;
    password: string;
    projects: Types.ObjectId[];
    reports: Types.ObjectId[];
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    reports: [{ type: Schema.Types.ObjectId, ref: 'Report' }]
});

export default mongoose.model<UserType>('User', UserSchema);