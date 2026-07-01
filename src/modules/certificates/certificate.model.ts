import { model, Schema, Types } from 'mongoose';

export interface ICertificate {
  enrollment: Types.ObjectId;
  certificateNo: string;
  issuedAt: Date;
  certificateUrl?: string;
}

const certificateSchema = new Schema<ICertificate>(
  {
    enrollment: { type: Schema.Types.ObjectId, ref: 'Enrollment', required: true, unique: true },
    certificateNo: { type: String, required: true, unique: true, trim: true },
    issuedAt: { type: Date, default: Date.now },
    certificateUrl: { type: String }
  },
  { timestamps: true, versionKey: false }
);

export const Certificate = model<ICertificate>('Certificate', certificateSchema);
