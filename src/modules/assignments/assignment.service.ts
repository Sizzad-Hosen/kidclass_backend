import httpStatus from 'http-status';
import { AppError } from '../../utils/AppError';
import { CourseService } from '../courses/course.service';
import { MilestoneService } from '../milestones/milestone.service';
import { ModuleService } from '../modules/module.service';
import { AssignmentCreatePayload, AssignmentUpdatePayload } from './assignment.interface';
import { Assignment } from './assignment.model';

const getAssignmentOrThrow = async (assignmentId: string) => {
  const assignment = await Assignment.findById(assignmentId);

  if (!assignment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Assignment not found');
  }

  return assignment;
};

const ensureFinalMilestone = async (milestoneId: string) => {
  const milestone = await MilestoneService.getMilestoneOrThrow(milestoneId);
  const lastMilestone = await MilestoneService.getLastMilestone(milestone.course.toString());

  if (!lastMilestone || lastMilestone._id.toString() !== milestone._id.toString()) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Assignment must only be added to the last milestone');
  }

  return milestone;
};

const createAssignment = async (payload: AssignmentCreatePayload, userId: string) => {
  const milestone = await ensureFinalMilestone(payload.milestone);
  await CourseService.ensureCourseOwnership(milestone.course.toString(), userId);

  if (payload.module) {
    const moduleItem = await ModuleService.getModuleOrThrow(payload.module);

    if (moduleItem.milestone.toString() !== payload.milestone) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Assignment module must belong to the selected milestone');
    }
  }

  return Assignment.create(payload);
};

const getAssignments = async () => {
  return Assignment.find()
    .populate('milestone', 'title order course')
    .populate('module', 'title order milestone')
    .sort({ createdAt: -1 });
};

const getAssignmentById = async (assignmentId: string) => {
  const assignment = await Assignment.findById(assignmentId)
    .populate('milestone', 'title order course')
    .populate('module', 'title order milestone');

  if (!assignment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Assignment not found');
  }

  return assignment;
};

const updateAssignment = async (assignmentId: string, payload: AssignmentUpdatePayload, userId: string) => {
  const assignment = await getAssignmentOrThrow(assignmentId);
  const milestone = await ensureFinalMilestone(assignment.milestone.toString());
  await CourseService.ensureCourseOwnership(milestone.course.toString(), userId);

  return Assignment.findByIdAndUpdate(assignmentId, payload, {
    new: true,
    runValidators: true
  });
};

const deleteAssignment = async (assignmentId: string, userId: string) => {
  const assignment = await getAssignmentOrThrow(assignmentId);
  const milestone = await MilestoneService.getMilestoneOrThrow(assignment.milestone.toString());
  await CourseService.ensureCourseOwnership(milestone.course.toString(), userId);

  return Assignment.findByIdAndDelete(assignmentId);
};

export const AssignmentService = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment
};
