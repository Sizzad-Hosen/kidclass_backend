import { model, Schema } from 'mongoose';
import { IQuiz } from './quiz.interface';

const optionSchema = new Schema(
  {
    text: { type: String, required: true, trim: true },
    isCorrect: { type: Boolean, required: true, default: false }
  },
  { _id: false }
);

const questionSchema = new Schema(
  {
    questionText: { type: String, required: true, trim: true },
    options: {
      type: [optionSchema],
      validate: [(options: unknown[]) => options.length >= 2, 'At least two options are required']
    },
    points: { type: Number, min: 1, default: 1 }
  },
  { _id: true }
);

const quizSchema = new Schema<IQuiz>(
  {
    module: { type: Schema.Types.ObjectId, ref: 'CourseModule', required: true },
    title: { type: String, required: true, trim: true },
    questions: {
      type: [questionSchema],
      validate: [(questions: unknown[]) => questions.length > 0, 'At least one question is required']
    },
    passingScore: { type: Number, min: 0, max: 100, default: 70 }
  },
  { timestamps: true, versionKey: false }
);

export const Quiz = model<IQuiz>('Quiz', quizSchema);
