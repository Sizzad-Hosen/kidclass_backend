import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { UserController } from './user.controller';
import {
  createUserValidationSchema,
  updateUserValidationSchema,
  userIdParamValidationSchema
} from './user.validation';

const router = Router();

router.use(authenticate, authorize('admin', 'super_admin'));

router.get('/', UserController.getUsers);
router.get('/:userId', validateRequest(userIdParamValidationSchema), UserController.getUserById);
router.post('/', validateRequest(createUserValidationSchema), UserController.createUser);
router.patch('/:userId', validateRequest(updateUserValidationSchema), UserController.updateUser);
router.delete('/:userId', validateRequest(userIdParamValidationSchema), UserController.deleteUser);

export const UserRoutes = router;
