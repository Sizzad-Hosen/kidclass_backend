import { model, Schema } from 'mongoose';
import { ILesson } from './lesson.interface';

const lessonSchema = new Schema<ILesson>(
  {
    module: { type: Schema.Types.ObjectId, ref: 'CourseModule', required: true },
    order: { type: Number, required: true, min: 1 },
    title: { type: String, required: true, trim: true },
    contentType: {
      type: String,
      enum: ['video', 'pdf', 'text', 'image'],
      required: true
    },
    duration: { type: Number, min: 0 },
    videoUrl: { type: String, trim: true },
    contentNotes: { type: String, required: true, trim: true }
  },
  { timestamps: true, versionKey: false }
);

lessonSchema.index({ module: 1, order: 1 }, { unique: true });

export const Lesson = model<ILesson>('Lesson', lessonSchema);
