import { Types } from 'mongoose';

export type AssignmentPart = 'quiz' | 'writing' | 'picture';

export type AssignmentOption = {
  text: string;
  isCorrect: boolean;
};

export type AssignmentQuestion = {
  questionText: string;
  options: AssignmentOption[];
  points: number;
};

export interface IAssignment {
  milestone: Types.ObjectId;
  module?: Types.ObjectId;
  title: string;
  instructions: string;
  assessmentParts: AssignmentPart[];
  questions: AssignmentQuestion[];
  dueDate?: Date;
  points: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AssignmentCreatePayload = {
  milestone: string;
  module?: string;
  title: string;
  instructions: string;
  assessmentParts?: AssignmentPart[];
  questions?: AssignmentQuestion[];
  dueDate?: Date;
  points?: number;
};

export type AssignmentUpdatePayload = Partial<Omit<AssignmentCreatePayload, 'milestone' | 'module'>>;
