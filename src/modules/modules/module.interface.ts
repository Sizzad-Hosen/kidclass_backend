import { Types } from 'mongoose';

export interface ICourseModule {
  milestone: Types.ObjectId;
  order: number;
  title: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ModuleCreatePayload = {
  milestone: string;
  order: number;
  title: string;
};

export type ModuleUpdatePayload = Partial<Pick<ModuleCreatePayload, 'order' | 'title'>>;
