import { model, Schema, Types } from 'mongoose';

export interface IQuizResult {
  student: Types.ObjectId;
  quiz: Types.ObjectId;
  score: number;
  totalPoints: number;
  passed: boolean;
  submittedAt: Date;
}

const quizResultSchema = new Schema<IQuizResult>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    score: { type: Number, required: true, min: 0 },
    totalPoints: { type: Number, required: true, min: 0 },
    passed: { type: Boolean, required: true },
    submittedAt: { type: Date, default: Date.now }
  },
  { timestamps: true, versionKey: false }
);

quizResultSchema.index({ student: 1, quiz: 1 });

export const QuizResult = model<IQuizResult>('QuizResult', quizResultSchema);
