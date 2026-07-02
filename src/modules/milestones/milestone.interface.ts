import { Types } from 'mongoose';

export interface IMilestone {
  course: Types.ObjectId;
  order: number;
  title: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type MilestoneCreatePayload = {
  course: string;
  order: number;
  title: string;
};

export type MilestoneUpdatePayload = Partial<Pick<MilestoneCreatePayload, 'order' | 'title'>>;
