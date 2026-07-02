import { model, Schema } from 'mongoose';
import { IMilestone } from './milestone.interface';

const milestoneSchema = new Schema<IMilestone>(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    order: { type: Number, required: true, min: 1 },
    title: { type: String, required: true, trim: true }
  },
  { timestamps: true, versionKey: false }
);

milestoneSchema.index({ course: 1, order: 1 }, { unique: true });

export const Milestone = model<IMilestone>('Milestone', milestoneSchema);
