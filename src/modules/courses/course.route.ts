import { Router } from 'express';
import { authenticate, authorize, optionalAuthenticate } from '../../middleware/auth';
import { upload } from '../../middleware/upload';
import { validateRequest } from '../../middleware/validateRequest';
import { COURSE_MANAGEMENT_ROLES } from './course.constant';
import { CourseController } from './course.controller';
import {
  courseIdParamValidationSchema,
  createCourseValidationSchema,
  updateCourseValidationSchema
} from './course.validation';

const router = Router();

router.get('/', optionalAuthenticate, CourseController.getCourses);
router.get('/:courseId/details', optionalAuthenticate, validateRequest(courseIdParamValidationSchema), CourseController.getCourseDetails);
router.get('/:courseId', optionalAuthenticate, validateRequest(courseIdParamValidationSchema), CourseController.getCourseById);
router.get(
  '/:courseId/structure',
  optionalAuthenticate,
  validateRequest(courseIdParamValidationSchema),
  CourseController.getCourseStructure
);

router.use(authenticate, authorize(...COURSE_MANAGEMENT_ROLES));

router.post('/', upload.single('thumbnail'), validateRequest(createCourseValidationSchema), CourseController.createCourse);
router.patch('/:courseId', upload.single('thumbnail'), validateRequest(updateCourseValidationSchema), CourseController.updateCourse);
router.patch('/:courseId/publish', validateRequest(courseIdParamValidationSchema), CourseController.publishCourse);
router.patch('/:courseId/archive', validateRequest(courseIdParamValidationSchema), CourseController.archiveCourse);
router.delete('/:courseId', validateRequest(courseIdParamValidationSchema), CourseController.deleteCourse);

export const CourseRoutes = router;
