import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

const assignmentPartSchema = z.enum(['quiz', 'writing', 'picture']);

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

const assignmentBodyBaseSchema = z.object({
  milestone: objectIdSchema,
  module: objectIdSchema.optional(),
  title: z.string().trim().min(1, 'Assignment title is required'),
  instructions: z.string().trim().min(1, 'Assignment instructions are required'),
  assessmentParts: z.array(assignmentPartSchema).min(1).default(['writing']),
  questions: z.array(questionSchema).default([]),
  dueDate: z.coerce.date().optional(),
  points: z.number().min(0, 'Points cannot be negative').default(0)
});

const assignmentBodySchema = assignmentBodyBaseSchema.refine((body) => !body.assessmentParts.includes('quiz') || body.questions.length > 0, {
  message: 'Quiz assignments must include at least one question',
  path: ['questions']
});

export const createAssignmentValidationSchema = z.object({
  body: assignmentBodySchema
});

export const updateAssignmentValidationSchema = z.object({
  params: z.object({
    assignmentId: objectIdSchema
  }),
  body: assignmentBodyBaseSchema
    .omit({ milestone: true, module: true })
    .partial()
    .refine((body) => Object.keys(body).length > 0, {
      message: 'At least one field is required'
    })
    .refine((body) => !body.assessmentParts?.includes('quiz') || Boolean(body.questions?.length), {
      message: 'Quiz assignments must include at least one question',
      path: ['questions']
    })
});

export const assignmentIdParamValidationSchema = z.object({
  params: z.object({
    assignmentId: objectIdSchema
  })
});

export const submitAssignmentValidationSchema = z.object({
  params: z.object({
    assignmentId: objectIdSchema
  }),
  body: z
    .object({
      content: z.string().trim().min(1).optional(),
      fileUrl: z.string().trim().url().optional(),
      answers: z.preprocess((value) => {
        if (typeof value !== 'string') {
          return value;
        }

        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }, z.array(z.object({
        question: objectIdSchema,
        selectedOptionIndexes: z.array(z.number().int().min(0)).default([])
      })).optional())
    })
    .refine((body) => body.content || body.fileUrl || body.answers?.length, {
      message: 'Content, fileUrl, picture, or quiz answers are required'
    })
});

export const gradeAssignmentSubmissionValidationSchema = z.object({
  params: z.object({
    assignmentId: objectIdSchema,
    studentId: objectIdSchema
  }),
  body: z.object({
    score: z.number().min(0, 'Score cannot be negative'),
    totalPoints: z.number().positive('Total points must be greater than 0')
  })
});
