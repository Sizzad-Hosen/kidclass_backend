import { model, Schema, Types } from 'mongoose';

export interface ICertificate {
  enrollment: Types.ObjectId;
  template?: Types.ObjectId;
  certificateNo: string;
  issuedAt: Date;
  certificateUrl?: string;
  recipientName?: string;
  recipientEmail?: string;
  courseName?: string;
  className?: string;
  subject?: string;
  issuerName?: string;
  issuerEmail?: string;
}

export interface ICertificateTemplate {
  title: string;
  course: Types.ObjectId;
  className: string;
  subject: string;
  issuerName: string;
  issuerEmail: string;
  createdBy: Types.ObjectId;
}

const certificateSchema = new Schema<ICertificate>(
  {
    enrollment: { type: Schema.Types.ObjectId, ref: 'Enrollment', required: true, unique: true },
    template: { type: Schema.Types.ObjectId, ref: 'CertificateTemplate' },
    certificateNo: { type: String, required: true, unique: true, trim: true },
    issuedAt: { type: Date, default: Date.now },
    certificateUrl: { type: String },
    recipientName: { type: String, trim: true },
    recipientEmail: { type: String, trim: true, lowercase: true },
    courseName: { type: String, trim: true },
    className: { type: String, trim: true },
    subject: { type: String, trim: true },
    issuerName: { type: String, trim: true },
    issuerEmail: { type: String, trim: true, lowercase: true },
  },
  { timestamps: true, versionKey: false }
);

export const Certificate = model<ICertificate>('Certificate', certificateSchema);

const certificateTemplateSchema = new Schema<ICertificateTemplate>(
  {
    title: { type: String, required: true, trim: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    className: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    issuerName: { type: String, required: true, trim: true },
    issuerEmail: { type: String, required: true, trim: true, lowercase: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true, versionKey: false }
);

certificateTemplateSchema.index({ course: 1, title: 1 });

export const CertificateTemplate = model<ICertificateTemplate>(
  'CertificateTemplate',
  certificateTemplateSchema
);
