import { Types } from 'mongoose';

export type QuizOption = {
  text: string;
  isCorrect: boolean;
};

export type QuizQuestion = {
  questionText: string;
  options: QuizOption[];
  points: number;
};

export interface IQuiz {
  module: Types.ObjectId;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type QuizCreatePayload = {
  module: string;
  title: string;
  questions: QuizQuestion[];
  passingScore?: number;
};

export type QuizUpdatePayload = Partial<Omit<QuizCreatePayload, 'module'>>;
