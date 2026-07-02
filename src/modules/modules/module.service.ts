import httpStatus from 'http-status';
import { Assignment } from '../assignments/assignment.model';
import { CourseService } from '../courses/course.service';
import { Lesson } from '../lessons/lesson.model';
import { MilestoneService } from '../milestones/milestone.service';
import { Quiz } from '../quizzes/quiz.model';
import { AppError } from '../../utils/AppError';
import { ModuleCreatePayload, ModuleUpdatePayload } from './module.interface';
import { CourseModule } from './module.model';

const getModuleOrThrow = async (moduleId: string) => {
  const moduleItem = await CourseModule.findById(moduleId);

  if (!moduleItem) {
    throw new AppError(httpStatus.NOT_FOUND, 'Module not found');
  }

  return moduleItem;
};

const ensureModuleOwnership = async (moduleId: string, userId: string) => {
  const moduleItem = await getModuleOrThrow(moduleId);
  const milestone = await MilestoneService.getMilestoneOrThrow(moduleItem.milestone.toString());
  await CourseService.ensureCourseOwnership(milestone.course.toString(), userId);

  return { moduleItem, milestone };
};

const createModule = async (payload: ModuleCreatePayload, userId: string) => {
  const milestone = await MilestoneService.getMilestoneOrThrow(payload.milestone);
  await CourseService.ensureCourseOwnership(milestone.course.toString(), userId);

  return CourseModule.create(payload);
};

const getModules = async () => {
  return CourseModule.find().populate('milestone', 'title order course').sort({ milestone: 1, order: 1 });
};

const getModuleById = async (moduleId: string) => {
  const moduleItem = await CourseModule.findById(moduleId).populate('milestone', 'title order course');

  if (!moduleItem) {
    throw new AppError(httpStatus.NOT_FOUND, 'Module not found');
  }

  return moduleItem;
};

const updateModule = async (moduleId: string, payload: ModuleUpdatePayload, userId: string) => {
  await ensureModuleOwnership(moduleId, userId);

  return CourseModule.findByIdAndUpdate(moduleId, payload, {
    new: true,
    runValidators: true
  });
};

const deleteModule = async (moduleId: string, userId: string) => {
  await ensureModuleOwnership(moduleId, userId);

  await Promise.all([
    Lesson.deleteMany({ module: moduleId }),
    Quiz.deleteMany({ module: moduleId }),
    Assignment.deleteMany({ module: moduleId })
  ]);

  return CourseModule.findByIdAndDelete(moduleId);
};

export const ModuleService = {
  createModule,
  getModules,
  getModuleById,
  updateModule,
  deleteModule,
  getModuleOrThrow,
  ensureModuleOwnership
};
