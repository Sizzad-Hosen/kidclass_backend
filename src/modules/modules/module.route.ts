import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { COURSE_MANAGEMENT_ROLES } from '../courses/course.constant';
import { ModuleController } from './module.controller';
import {
  createModuleValidationSchema,
  moduleIdParamValidationSchema,
  updateModuleValidationSchema
} from './module.validation';

const router = Router();

router.get('/', ModuleController.getModules);
router.get('/:moduleId', validateRequest(moduleIdParamValidationSchema), ModuleController.getModuleById);

router.use(authenticate, authorize(...COURSE_MANAGEMENT_ROLES));

router.post('/', validateRequest(createModuleValidationSchema), ModuleController.createModule);
router.patch('/:moduleId', validateRequest(updateModuleValidationSchema), ModuleController.updateModule);
router.delete('/:moduleId', validateRequest(moduleIdParamValidationSchema), ModuleController.deleteModule);

export const ModuleRoutes = router;
