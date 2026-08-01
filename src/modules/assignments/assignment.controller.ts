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

const getMyAssignments = catchAsync(async (req, res) => {
  const result = await AssignmentService.getMyAssignments(req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student assignments fetched successfully',
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

const submitAssignment = catchAsync(async (req, res) => {
  const result = await AssignmentService.submitAssignment(
    req.params.assignmentId as string,
    req.user!.userId,
    req.body,
    req.file
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Assignment submitted successfully',
    data: result
  });
});

const gradeAssignmentSubmission = catchAsync(async (req, res) => {
  const result = await AssignmentService.gradeAssignmentSubmission(
    req.params.assignmentId as string,
    req.params.studentId as string,
    req.body,
    req.user!.userId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Assignment submission graded successfully',
    data: result
  });
});

const getAssignmentSubmissions = catchAsync(async (req, res) => {
  const result = await AssignmentService.getAssignmentSubmissions(
    req.params.assignmentId as string,
    req.user!.userId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Assignment submissions fetched successfully',
    data: result
  });
});

export const AssignmentController = {
  createAssignment,
  getAssignments,
  getMyAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeAssignmentSubmission,
  getAssignmentSubmissions
};
