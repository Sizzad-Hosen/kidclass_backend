import { model, Schema } from 'mongoose';
import { IAssignment } from './assignment.interface';

const optionSchema = new Schema(
  {
    text: { type: String, required: true, trim: true },
    isCorrect: { type: Boolean, required: true, default: false }
  },
  { _id: false }
);

const questionSchema = new Schema(
  {
    questionText: { type: String, required: true, trim: true },
    options: {
      type: [optionSchema],
      validate: [(options: unknown[]) => options.length >= 2, 'At least two options are required']
    },
    points: { type: Number, min: 1, default: 1 }
  },
  { _id: true }
);

const assignmentSchema = new Schema<IAssignment>(
  {
    milestone: { type: Schema.Types.ObjectId, ref: 'Milestone', required: true },
    module: { type: Schema.Types.ObjectId, ref: 'CourseModule' },
    title: { type: String, required: true, trim: true },
    instructions: { type: String, required: true, trim: true },
    assessmentParts: {
      type: [String],
      enum: ['quiz', 'writing', 'picture'],
      default: ['writing']
    },
    questions: { type: [questionSchema], default: [] },
    dueDate: { type: Date },
    points: { type: Number, min: 0, default: 0 }
  },
  { timestamps: true, versionKey: false }
);

assignmentSchema.index({ milestone: 1 }, { unique: true });

export const Assignment = model<IAssignment>('Assignment', assignmentSchema);
