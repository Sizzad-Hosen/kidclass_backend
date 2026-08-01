import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { UserService } from './user.service';

const getUsers = catchAsync(async (req, res) => {
  const result = await UserService.getUsers({
    search: typeof req.query.search === 'string' ? req.query.search : undefined,
    role: typeof req.query.role === 'string' ? req.query.role : undefined,
    status: typeof req.query.status === 'string' ? req.query.status : undefined,
    page: typeof req.query.page === 'string' ? req.query.page : undefined,
    limit: typeof req.query.limit === 'string' ? req.query.limit : undefined
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users fetched successfully',
    data: result
  });
});

const getUserById = catchAsync(async (req, res) => {
  const result = await UserService.getUserById(req.params.userId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User fetched successfully',
    data: result
  });
});

const createUser = catchAsync(async (req, res) => {
  const result = await UserService.createUser(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User created successfully',
    data: result
  });
});

const updateUser = catchAsync(async (req, res) => {
  const result = await UserService.updateUser(req.params.userId as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User updated successfully',
    data: result
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const result = await UserService.deleteUser(req.params.userId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully',
    data: result
  });
});

export const UserController = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
