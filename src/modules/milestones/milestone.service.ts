import httpStatus from 'http-status';
import { Assignment } from '../assignments/assignment.model';
import { Lesson } from '../lessons/lesson.model';
import { CourseModule } from '../modules/module.model';
import { Quiz } from '../quizzes/quiz.model';
import { AppError } from '../../utils/AppError';
import { CourseService } from '../courses/course.service';
import { MilestoneCreatePayload, MilestoneUpdatePayload } from './milestone.interface';
import { Milestone } from './milestone.model';

const getMilestoneOrThrow = async (milestoneId: string) => {
  const milestone = await Milestone.findById(milestoneId);

  if (!milestone) {
    throw new AppError(httpStatus.NOT_FOUND, 'Milestone not found');
  }

  return milestone;
};

const getLastMilestone = async (courseId: string) => {
  return Milestone.findOne({ course: courseId }).sort({ order: -1 });
};

const ensureCourseHasNoAssignment = async (courseId: string) => {
  const milestones = await Milestone.find({ course: courseId }).select('_id');
  const milestoneIds = milestones.map((milestone) => milestone._id);
  const assignment = await Assignment.findOne({ milestone: { $in: milestoneIds } });

  if (assignment) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Cannot change milestone order after final milestone assignment is added'
    );
  }
};

const createMilestone = async (payload: MilestoneCreatePayload, userId: string) => {
  await CourseService.ensureCourseOwnership(payload.course, userId);
  await ensureCourseHasNoAssignment(payload.course);

  return Milestone.create(payload);
};

const getMilestones = async () => {
  return Milestone.find().populate('course', 'title category isPublished').sort({ course: 1, order: 1 });
};

const getMilestoneById = async (milestoneId: string) => {
  const milestone = await Milestone.findById(milestoneId).populate('course', 'title category isPublished');

  if (!milestone) {
    throw new AppError(httpStatus.NOT_FOUND, 'Milestone not found');
  }

  return milestone;
};

const updateMilestone = async (milestoneId: string, payload: MilestoneUpdatePayload, userId: string) => {
  const milestone = await getMilestoneOrThrow(milestoneId);
  await CourseService.ensureCourseOwnership(milestone.course.toString(), userId);

  if (payload.order && payload.order !== milestone.order) {
    await ensureCourseHasNoAssignment(milestone.course.toString());
  }

  return Milestone.findByIdAndUpdate(milestoneId, payload, {
    new: true,
    runValidators: true
  });
};

const deleteMilestone = async (milestoneId: string, userId: string) => {
  const milestone = await getMilestoneOrThrow(milestoneId);
  await CourseService.ensureCourseOwnership(milestone.course.toString(), userId);

  const modules = await CourseModule.find({ milestone: milestoneId }).select('_id');
  const moduleIds = modules.map((moduleItem) => moduleItem._id);

  await Promise.all([
    Lesson.deleteMany({ module: { $in: moduleIds } }),
    Quiz.deleteMany({ module: { $in: moduleIds } }),
    Assignment.deleteMany({ milestone: milestoneId }),
    CourseModule.deleteMany({ milestone: milestoneId })
  ]);

  return Milestone.findByIdAndDelete(milestoneId);
};

export const MilestoneService = {
  createMilestone,
  getMilestones,
  getMilestoneById,
  getLastMilestone,
  updateMilestone,
  deleteMilestone,
  getMilestoneOrThrow
};
