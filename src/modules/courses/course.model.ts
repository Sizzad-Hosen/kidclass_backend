import { model, Schema, Types } from 'mongoose';

export type ClassLevel = 'class-1' | 'class-2' | 'class-3';

export interface ICourse {
  title: string;
  slug: string;
  description?: string;
  classLevel: ClassLevel;
  thumbnailUrl?: string;
  price: number;
  isPublished: boolean;
  createdBy: Types.ObjectId;
}

const courseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    classLevel: {
      type: String,
      enum: ['class-1', 'class-2', 'class-3'],
      required: true
    },
    thumbnailUrl: { type: String },
    price: { type: Number, required: true, min: 0, default: 0 },
    isPublished: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true, versionKey: false }
);

courseSchema.index({ classLevel: 1, isPublished: 1 });

export const Course = model<ICourse>('Course', courseSchema);
