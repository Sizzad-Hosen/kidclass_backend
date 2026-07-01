import { model, Schema, Types } from 'mongoose';

export interface ICourseModule {
  course: Types.ObjectId;
  title: string;
  description?: string;
  order: number;
}

const courseModuleSchema = new Schema<ICourseModule>(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    order: { type: Number, required: true, min: 0 }
  },
  { timestamps: true, versionKey: false }
);

courseModuleSchema.index({ course: 1, order: 1 }, { unique: true });

export const CourseModule = model<ICourseModule>('CourseModule', courseModuleSchema);
