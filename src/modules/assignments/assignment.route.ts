import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { COURSE_MANAGEMENT_ROLES } from '../courses/course.constant';
import { AssignmentController } from './assignment.controller';
import {
  assignmentIdParamValidationSchema,
  createAssignmentValidationSchema,
  updateAssignmentValidationSchema
} from './assignment.validation';

const router = Router();

router.use(authenticate, authorize(...COURSE_MANAGEMENT_ROLES));

router.post('/', validateRequest(createAssignmentValidationSchema), AssignmentController.createAssignment);
router.get('/', AssignmentController.getAssignments);
router.get('/:assignmentId', validateRequest(assignmentIdParamValidationSchema), AssignmentController.getAssignmentById);
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
