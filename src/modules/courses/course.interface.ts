import { Types } from 'mongoose';
import { COURSE_CATEGORIES } from './course.constant';

export type CourseCategory = (typeof COURSE_CATEGORIES)[number];

export interface ICourse {
  title: string;
  description?: string;
  thumbnailImage?: string;
  price: number;
  category: CourseCategory;
  isPublished: boolean;
  courseManager: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CourseCreatePayload = {
  title: string;
  description?: string;
  thumbnailImage?: string;
  price?: number;
  category: CourseCategory;
  isPublished?: boolean;
};

export type CourseUpdatePayload = Partial<CourseCreatePayload>;
