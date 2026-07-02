import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const createEnrollmentValidationSchema = z.object({
  body: z.object({
    course: objectIdSchema
  })
});

export const enrollmentIdParamValidationSchema = z.object({
  params: z.object({
    enrollmentId: objectIdSchema
  })
});
