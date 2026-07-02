import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import { COURSE_MANAGEMENT_ROLES } from '../courses/course.constant';
import { QuizController } from './quiz.controller';
import { createQuizValidationSchema, quizIdParamValidationSchema, updateQuizValidationSchema } from './quiz.validation';

const router = Router();

router.use(authenticate, authorize(...COURSE_MANAGEMENT_ROLES));

router.post('/', validateRequest(createQuizValidationSchema), QuizController.createQuiz);
router.get('/', QuizController.getQuizzes);
router.get('/:quizId', validateRequest(quizIdParamValidationSchema), QuizController.getQuizById);
router.patch('/:quizId', validateRequest(updateQuizValidationSchema), QuizController.updateQuiz);
router.delete('/:quizId', validateRequest(quizIdParamValidationSchema), QuizController.deleteQuiz);

export const QuizRoutes = router;
