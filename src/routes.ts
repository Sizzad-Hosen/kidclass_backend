import { Router } from 'express';
import { AssignmentRoutes } from './modules/assignments/assignment.route';
import { AuthRoutes } from './modules/auth/auth.route';
import { CourseRoutes } from './modules/courses/course.route';
import { LessonRoutes } from './modules/lessons/lesson.route';
import { MilestoneRoutes } from './modules/milestones/milestone.route';
import { ModuleRoutes } from './modules/modules/module.route';
import { QuizRoutes } from './modules/quizzes/quiz.route';

const router = Router();

router.use('/auth', AuthRoutes);
router.use('/courses', CourseRoutes);
router.use('/milestones', MilestoneRoutes);
router.use('/modules', ModuleRoutes);
router.use('/lessons', LessonRoutes);
router.use('/quizzes', QuizRoutes);
router.use('/assignments', AssignmentRoutes);

export const routes = router;
