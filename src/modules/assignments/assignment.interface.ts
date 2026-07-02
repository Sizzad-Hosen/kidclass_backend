import { Types } from 'mongoose';

export interface IAssignment {
  milestone: Types.ObjectId;
  module?: Types.ObjectId;
  title: string;
  instructions: string;
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
  dueDate?: Date;
  points?: number;
};

export type AssignmentUpdatePayload = Partial<Omit<AssignmentCreatePayload, 'milestone' | 'module'>>;
