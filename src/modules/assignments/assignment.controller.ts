import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { AssignmentService } from './assignment.service';

const createAssignment = catchAsync(async (req, res) => {
  const result = await AssignmentService.createAssignment(req.body, req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Assignment created successfully',
    data: result
  });
});

const getAssignments = catchAsync(async (_req, res) => {
  const result = await AssignmentService.getAssignments();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Assignments fetched successfully',
    data: result
  });
});

const getAssignmentById = catchAsync(async (req, res) => {
  const result = await AssignmentService.getAssignmentById(req.params.assignmentId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Assignment fetched successfully',
    data: result
  });
});

const updateAssignment = catchAsync(async (req, res) => {
  const result = await AssignmentService.updateAssignment(req.params.assignmentId as string, req.body, req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Assignment updated successfully',
    data: result
  });
});

const deleteAssignment = catchAsync(async (req, res) => {
  const result = await AssignmentService.deleteAssignment(req.params.assignmentId as string, req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Assignment deleted successfully',
    data: result
  });
});

export const AssignmentController = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment
};
