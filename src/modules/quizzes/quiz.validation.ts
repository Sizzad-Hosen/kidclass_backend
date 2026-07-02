import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

const optionSchema = z.object({
  text: z.string().trim().min(1, 'Option text is required'),
  isCorrect: z.boolean()
});

const questionSchema = z
  .object({
    questionText: z.string().trim().min(1, 'Question text is required'),
    options: z.array(optionSchema).min(2, 'At least two options are required'),
    points: z.number().int().min(1, 'Question points must be at least 1').default(1)
  })
  .refine((question) => question.options.some((option) => option.isCorrect), {
    message: 'At least one option must be correct',
    path: ['options']
  });

const quizBodySchema = z.object({
  module: objectIdSchema,
  title: z.string().trim().min(1, 'Quiz title is required'),
  questions: z.array(questionSchema).min(1, 'Quiz must have questions'),
  passingScore: z.number().min(0).max(100).default(70)
});

export const createQuizValidationSchema = z.object({
  body: quizBodySchema
});

export const updateQuizValidationSchema = z.object({
  params: z.object({
    quizId: objectIdSchema
  }),
  body: quizBodySchema
    .omit({ module: true })
    .partial()
    .refine((body) => Object.keys(body).length > 0, {
      message: 'At least one field is required'
    })
});

export const quizIdParamValidationSchema = z.object({
  params: z.object({
    quizId: objectIdSchema
  })
});
