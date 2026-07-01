import { model, Schema, Types } from 'mongoose';

export type LessonContentType = 'video' | 'pdf' | 'text' | 'image';

export interface ILesson {
  module: Types.ObjectId;
  title: string;
  contentType: LessonContentType;
  contentUrl?: string;
  contentText?: string;
  durationMinutes?: number;
  order: number;
  isPreview: boolean;
}

const lessonSchema = new Schema<ILesson>(
  {
    module: { type: Schema.Types.ObjectId, ref: 'CourseModule', required: true },
    title: { type: String, required: true, trim: true },
    contentType: {
      type: String,
      enum: ['video', 'pdf', 'text', 'image'],
      required: true
    },
    contentUrl: { type: String },
    contentText: { type: String },
    durationMinutes: { type: Number, min: 0 },
    order: { type: Number, required: true, min: 0 },
    isPreview: { type: Boolean, default: false }
  },
  { timestamps: true, versionKey: false }
);

lessonSchema.index({ module: 1, order: 1 }, { unique: true });

export const Lesson = model<ILesson>('Lesson', lessonSchema);
