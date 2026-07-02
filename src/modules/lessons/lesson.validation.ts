import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

const lessonBodySchema = z.object({
  module: objectIdSchema,
  order: z.coerce.number().int().min(1, 'Lesson order must be at least 1'),
  title: z.string().trim().min(1, 'Lesson title is required'),
  contentType: z.enum(['video', 'text', 'pdf', 'image']),
  duration: z.coerce.number().min(0, 'Duration cannot be negative').optional(),
  videoUrl: z.string().trim().url('Video URL must be valid').optional(),
  contentNotes: z.string().trim().min(1, 'Lesson content is required')
});

export const createLessonValidationSchema = z.object({
  body: lessonBodySchema
});

export const updateLessonValidationSchema = z.object({
  params: z.object({
    lessonId: objectIdSchema
  }),
  body: lessonBodySchema
    .omit({ module: true })
    .partial()
    .refine((body) => Object.keys(body).length > 0, {
      message: 'At least one field is required'
    })
});

export const lessonIdParamValidationSchema = z.object({
  params: z.object({
    lessonId: objectIdSchema
  })
});
