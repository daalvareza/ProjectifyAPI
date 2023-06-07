import mongoose, { Schema, Document, Types } from "mongoose";

export interface ReportType extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId[];
    project: Types.ObjectId[];
    weekNumber: Number;
    hours: Number;
    year: Number;
}

const ReportSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    weekNumber: { type: Number, required: true },
    hours: { type: Number, required: true },
    year: { type: Number, required: true }
});

export default mongoose.model<ReportType>('Report', ReportSchema);