import { model, Schema, Types } from 'mongoose';

export type EnrollmentStatus = 'active' | 'completed' | 'cancelled';

export interface IEnrollment {
  student: Types.ObjectId;
  course: Types.ObjectId;
  status: EnrollmentStatus;
  enrolledAt: Date;
  completedAt?: Date;
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active'
    },
    enrolledAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
  },
  { timestamps: true, versionKey: false }
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export const Enrollment = model<IEnrollment>('Enrollment', enrollmentSchema);
