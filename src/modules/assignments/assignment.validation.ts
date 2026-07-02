import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

const assignmentBodySchema = z.object({
  milestone: objectIdSchema,
  module: objectIdSchema.optional(),
  title: z.string().trim().min(1, 'Assignment title is required'),
  instructions: z.string().trim().min(1, 'Assignment instructions are required'),
  dueDate: z.coerce.date().optional(),
  points: z.number().min(0, 'Points cannot be negative').default(0)
});

export const createAssignmentValidationSchema = z.object({
  body: assignmentBodySchema
});

export const updateAssignmentValidationSchema = z.object({
  params: z.object({
    assignmentId: objectIdSchema
  }),
  body: assignmentBodySchema
    .omit({ milestone: true, module: true })
    .partial()
    .refine((body) => Object.keys(body).length > 0, {
      message: 'At least one field is required'
    })
});

export const assignmentIdParamValidationSchema = z.object({
  params: z.object({
    assignmentId: objectIdSchema
  })
});
