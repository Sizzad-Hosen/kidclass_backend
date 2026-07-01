import { model, Schema, Types } from 'mongoose';

export type LessonProgressStatus = 'not-started' | 'in-progress' | 'completed';

export interface IProgress {
  enrollment: Types.ObjectId;
  lesson: Types.ObjectId;
  status: LessonProgressStatus;
  watchedSeconds: number;
  completedAt?: Date;
}

const progressSchema = new Schema<IProgress>(
  {
    enrollment: { type: Schema.Types.ObjectId, ref: 'Enrollment', required: true },
    lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started'
    },
    watchedSeconds: { type: Number, min: 0, default: 0 },
    completedAt: { type: Date }
  },
  { timestamps: true, versionKey: false }
);

progressSchema.index({ enrollment: 1, lesson: 1 }, { unique: true });

export const Progress = model<IProgress>('Progress', progressSchema);
