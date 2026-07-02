import { model, Schema } from 'mongoose';
import { COURSE_CATEGORIES } from './course.constant';
import { ICourse } from './course.interface';

const courseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    thumbnailImage: { type: String, trim: true },
    price: { type: Number, required: true, min: 0, default: 0 },
    category: {
      type: String,
      enum: COURSE_CATEGORIES,
      required: true
    },
    isPublished: { type: Boolean, default: false },
    courseManager: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true, versionKey: false }
);

courseSchema.index({ courseManager: 1, title: 1 });
courseSchema.index({ category: 1, isPublished: 1 });

export const Course = model<ICourse>('Course', courseSchema);
