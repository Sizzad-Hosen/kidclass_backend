import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { AuthController } from './auth.controller';
import { loginValidationSchema, registerValidationSchema } from './auth.validation';

const router = Router();

router.post('/register', validateRequest(registerValidationSchema), AuthController.registerUser);
router.post('/login', validateRequest(loginValidationSchema), AuthController.loginUser);
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.getMe);

export const AuthRoutes = router;
