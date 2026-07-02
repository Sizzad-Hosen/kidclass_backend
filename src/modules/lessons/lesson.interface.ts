import { Types } from 'mongoose';

export type LessonContentType = 'video' | 'text' | 'pdf' | 'image';

export interface ILesson {
  module: Types.ObjectId;
  order: number;
  title: string;
  contentType: LessonContentType;
  duration?: number;
  videoUrl?: string;
  contentNotes: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type LessonCreatePayload = {
  module: string;
  order: number;
  title: string;
  contentType: LessonContentType;
  duration?: number;
  videoUrl?: string;
  contentNotes: string;
};

export type LessonUpdatePayload = Partial<Omit<LessonCreatePayload, 'module'>>;
