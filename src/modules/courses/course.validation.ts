import { z } from 'zod';
import { COURSE_CATEGORIES } from './course.constant';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

const multipartBoolean = z.preprocess(
  (value) => value === 'true' ? true : value === 'false' ? false : value,
  z.boolean()
);

const courseBodySchema = z.object({
  title: z.string().trim().min(1, 'Course title is required'),
  description: z.string().trim().optional(),
  thumbnailImage: z.string().trim().url('Thumbnail image must be a valid URL').optional(),
  price: z.coerce.number().min(0, 'Price cannot be negative').default(0),
  category: z.enum(COURSE_CATEGORIES),
  isPublished: multipartBoolean.default(false)
});

export const createCourseValidationSchema = z.object({
  body: courseBodySchema
});

export const updateCourseValidationSchema = z.object({
  params: z.object({
    courseId: objectIdSchema
  }),
  body: courseBodySchema.partial().refine((body) => Object.keys(body).length > 0, {
    message: 'At least one field is required'
  })
});

export const courseIdParamValidationSchema = z.object({
  params: z.object({
    courseId: objectIdSchema
  })
});
