import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { ProgressController } from './progress.controller';
import {
  courseIdParamValidationSchema,
  enrollmentIdParamValidationSchema,
  updateLessonProgressValidationSchema
} from './progress.validation';

const router = Router();

router.use(authenticate);

router.patch(
  '/lessons/:lessonId',
  authorize('student'),
  validateRequest(updateLessonProgressValidationSchema),
  ProgressController.updateLessonProgress
);
router.get(
  '/courses/:courseId',
  authorize('student'),
  validateRequest(courseIdParamValidationSchema),
  ProgressController.getCourseProgressByCourse
);
router.get(
  '/enrollments/:enrollmentId',
  validateRequest(enrollmentIdParamValidationSchema),
  ProgressController.getCourseProgressByEnrollment
);

export const ProgressRoutes = router;
