import { model, Schema } from 'mongoose';
import { ICourseModule } from './module.interface';

const courseModuleSchema = new Schema<ICourseModule>(
  {
    milestone: { type: Schema.Types.ObjectId, ref: 'Milestone', required: true },
    order: { type: Number, required: true, min: 1 },
    title: { type: String, required: true, trim: true }
  },
  { timestamps: true, versionKey: false }
);

courseModuleSchema.index({ milestone: 1, order: 1 }, { unique: true });

export const CourseModule = model<ICourseModule>('CourseModule', courseModuleSchema);
