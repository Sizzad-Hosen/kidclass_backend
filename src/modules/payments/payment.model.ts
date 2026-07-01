import { model, Schema, Types } from 'mongoose';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface IPayment {
  enrollment: Types.ObjectId;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider?: string;
  transactionId?: string;
  paidAt?: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    enrollment: { type: Schema.Types.ObjectId, ref: 'Enrollment', required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, uppercase: true, default: 'USD' },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    provider: { type: String, trim: true },
    transactionId: { type: String, trim: true },
    paidAt: { type: Date }
  },
  { timestamps: true, versionKey: false }
);

paymentSchema.index({ enrollment: 1 });
paymentSchema.index({ transactionId: 1 }, { sparse: true, unique: true });

export const Payment = model<IPayment>('Payment', paymentSchema);
