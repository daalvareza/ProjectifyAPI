import mongoose, { Schema } from "mongoose";

const ReportSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    weekNumber: { type: Number, required: true },
    hours: { type: Number, required: true },
    year: { type: Number, required: true }
});

export default mongoose.model('Report', ReportSchema);