import { model, Schema } from 'mongoose';
import { IAssignment } from './assignment.interface';

const assignmentSchema = new Schema<IAssignment>(
  {
    milestone: { type: Schema.Types.ObjectId, ref: 'Milestone', required: true },
    module: { type: Schema.Types.ObjectId, ref: 'CourseModule' },
    title: { type: String, required: true, trim: true },
    instructions: { type: String, required: true, trim: true },
    dueDate: { type: Date },
    points: { type: Number, min: 0, default: 0 }
  },
  { timestamps: true, versionKey: false }
);

assignmentSchema.index({ milestone: 1 }, { unique: true });

export const Assignment = model<IAssignment>('Assignment', assignmentSchema);
