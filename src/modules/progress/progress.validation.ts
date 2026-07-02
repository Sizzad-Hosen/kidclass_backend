import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const updateLessonProgressValidationSchema = z.object({
  params: z.object({
    lessonId: objectIdSchema
  }),
  body: z.object({
    status: z.enum(['not-started', 'in-progress', 'completed']),
    watchedSeconds: z.number().min(0, 'Watched seconds cannot be negative').default(0)
  })
});

export const courseIdParamValidationSchema = z.object({
  params: z.object({
    courseId: objectIdSchema
  })
});

export const enrollmentIdParamValidationSchema = z.object({
  params: z.object({
    enrollmentId: objectIdSchema
  })
});
