import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { COURSE_MANAGEMENT_ROLES } from './course.constant';
import { CourseController } from './course.controller';
import {
  courseIdParamValidationSchema,
  createCourseValidationSchema,
  updateCourseValidationSchema
} from './course.validation';

const router = Router();

router.use(authenticate, authorize(...COURSE_MANAGEMENT_ROLES));

router.get('/', CourseController.getCourses);
router.get('/:courseId/details', validateRequest(courseIdParamValidationSchema), CourseController.getCourseDetails);
router.get('/:courseId', validateRequest(courseIdParamValidationSchema), CourseController.getCourseById);
router.get(
  '/:courseId/structure',
  validateRequest(courseIdParamValidationSchema),
  CourseController.getCourseStructure
);

router.post('/', validateRequest(createCourseValidationSchema), CourseController.createCourse);
router.patch('/:courseId', validateRequest(updateCourseValidationSchema), CourseController.updateCourse);
router.delete('/:courseId', validateRequest(courseIdParamValidationSchema), CourseController.deleteCourse);

export const CourseRoutes = router;
