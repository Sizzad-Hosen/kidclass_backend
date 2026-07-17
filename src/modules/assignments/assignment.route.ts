import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { upload } from '../../middleware/upload';
import { validateRequest } from '../../middleware/validateRequest';
import { COURSE_MANAGEMENT_ROLES } from '../courses/course.constant';
import { AssignmentController } from './assignment.controller';
import {
  assignmentIdParamValidationSchema,
  createAssignmentValidationSchema,
  gradeAssignmentSubmissionValidationSchema,
  submitAssignmentValidationSchema,
  updateAssignmentValidationSchema
} from './assignment.validation';

const router = Router();

router.get('/me', authenticate, authorize('student'), AssignmentController.getMyAssignments);

router.post(
  '/:assignmentId/submissions',
  authenticate,
  authorize('student'),
  upload.single('picture'),
  validateRequest(submitAssignmentValidationSchema),
  AssignmentController.submitAssignment
);
router.get(
  '/:assignmentId',
  authenticate,
  validateRequest(assignmentIdParamValidationSchema),
  AssignmentController.getAssignmentById
);

router.use(authenticate, authorize(...COURSE_MANAGEMENT_ROLES));

router.post('/', validateRequest(createAssignmentValidationSchema), AssignmentController.createAssignment);
router.get('/', AssignmentController.getAssignments);
router.get(
  '/:assignmentId/submissions',
  validateRequest(assignmentIdParamValidationSchema),
  AssignmentController.getAssignmentSubmissions
);
router.patch(
  '/:assignmentId/submissions/:studentId',
  validateRequest(gradeAssignmentSubmissionValidationSchema),
  AssignmentController.gradeAssignmentSubmission
);
router.patch(
  '/:assignmentId',
  validateRequest(updateAssignmentValidationSchema),
  AssignmentController.updateAssignment
);
router.delete(
  '/:assignmentId',
  validateRequest(assignmentIdParamValidationSchema),
  AssignmentController.deleteAssignment
);

export const AssignmentRoutes = router;
