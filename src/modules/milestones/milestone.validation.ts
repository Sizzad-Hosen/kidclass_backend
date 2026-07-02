import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

const milestoneBodySchema = z.object({
  course: objectIdSchema,
  order: z.number().int().min(1, 'Milestone order must be at least 1'),
  title: z.string().trim().min(1, 'Milestone title is required')
});

export const createMilestoneValidationSchema = z.object({
  body: milestoneBodySchema
});

export const updateMilestoneValidationSchema = z.object({
  params: z.object({
    milestoneId: objectIdSchema
  }),
  body: milestoneBodySchema
    .pick({ order: true, title: true })
    .partial()
    .refine((body) => Object.keys(body).length > 0, {
      message: 'At least one field is required'
    })
});

export const milestoneIdParamValidationSchema = z.object({
  params: z.object({
    milestoneId: objectIdSchema
  })
});
