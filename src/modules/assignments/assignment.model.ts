import { model, Schema, Types } from 'mongoose';

export interface IAssignment {
  lesson?: Types.ObjectId;
  module?: Types.ObjectId;
  title: string;
  instructions: string;
  dueDate?: Date;
  points: number;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    lesson: { type: Schema.Types.ObjectId, ref: 'Lesson' },
    module: { type: Schema.Types.ObjectId, ref: 'CourseModule' },
    title: { type: String, required: true, trim: true },
    instructions: { type: String, required: true, trim: true },
    dueDate: { type: Date },
    points: { type: Number, min: 0, default: 0 }
  },
  { timestamps: true, versionKey: false }
);

export const Assignment = model<IAssignment>('Assignment', assignmentSchema);
