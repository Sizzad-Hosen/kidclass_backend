import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { DashboardController } from './dashboard.controller';

const router = Router();

router.use(authenticate, authorize('admin', 'super_admin'));

router.get('/overview', DashboardController.getDashboardOverview);
router.get('/metadata', DashboardController.getDashboardMetadata);
router.get('/recent-activity', DashboardController.getRecentActivity);
router.get('/revenue', DashboardController.getRevenueDashboard);
router.get('/courses', DashboardController.getCourseDashboardDetails);
router.get('/students', DashboardController.getStudentDashboardDetails);
router.get('/enrollments', DashboardController.getEnrollmentDashboardDetails);

export const DashboardRoutes = router;
