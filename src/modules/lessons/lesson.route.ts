import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { COURSE_MANAGEMENT_ROLES } from '../courses/course.constant';
import { LessonController } from './lesson.controller';
import {
  createLessonValidationSchema,
  lessonIdParamValidationSchema,
  updateLessonValidationSchema
} from './lesson.validation';

const router = Router();

router.get('/', LessonController.getLessons);
router.get('/:lessonId', validateRequest(lessonIdParamValidationSchema), LessonController.getLessonById);

router.use(authenticate, authorize(...COURSE_MANAGEMENT_ROLES));

router.post('/', validateRequest(createLessonValidationSchema), LessonController.createLesson);
router.patch('/:lessonId', validateRequest(updateLessonValidationSchema), LessonController.updateLesson);
router.delete('/:lessonId', validateRequest(lessonIdParamValidationSchema), LessonController.deleteLesson);

export const LessonRoutes = router;
