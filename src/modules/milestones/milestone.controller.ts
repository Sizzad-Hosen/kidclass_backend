import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { MilestoneService } from './milestone.service';

const createMilestone = catchAsync(async (req, res) => {
  const result = await MilestoneService.createMilestone(req.body, req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Milestone created successfully',
    data: result
  });
});

const getMilestones = catchAsync(async (_req, res) => {
  const result = await MilestoneService.getMilestones();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Milestones fetched successfully',
    data: result
  });
});

const getMilestoneById = catchAsync(async (req, res) => {
  const result = await MilestoneService.getMilestoneById(req.params.milestoneId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Milestone fetched successfully',
    data: result
  });
});

const updateMilestone = catchAsync(async (req, res) => {
  const result = await MilestoneService.updateMilestone(req.params.milestoneId as string, req.body, req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Milestone updated successfully',
    data: result
  });
});

const deleteMilestone = catchAsync(async (req, res) => {
  const result = await MilestoneService.deleteMilestone(req.params.milestoneId as string, req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Milestone deleted successfully',
    data: result
  });
});

export const MilestoneController = {
  createMilestone,
  getMilestones,
  getMilestoneById,
  updateMilestone,
  deleteMilestone
};
