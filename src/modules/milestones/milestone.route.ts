import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { COURSE_MANAGEMENT_ROLES } from '../courses/course.constant';
import { MilestoneController } from './milestone.controller';
import {
  createMilestoneValidationSchema,
  milestoneIdParamValidationSchema,
  updateMilestoneValidationSchema
} from './milestone.validation';

const router = Router();

router.use(authenticate, authorize(...COURSE_MANAGEMENT_ROLES));

router.post('/', validateRequest(createMilestoneValidationSchema), MilestoneController.createMilestone);
router.get('/', MilestoneController.getMilestones);
router.get('/:milestoneId', validateRequest(milestoneIdParamValidationSchema), MilestoneController.getMilestoneById);
router.patch(
  '/:milestoneId',
  validateRequest(updateMilestoneValidationSchema),
  MilestoneController.updateMilestone
);
router.delete(
  '/:milestoneId',
  validateRequest(milestoneIdParamValidationSchema),
  MilestoneController.deleteMilestone
);

export const MilestoneRoutes = router;
