import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { AuthService } from './auth.service';

const registerUser = catchAsync(async (req, res) => {
  const result = await AuthService.registerUser(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Student registered successfully',
    data: result
  });
});

const loginUser = catchAsync(async (req, res) => {
  const result = await AuthService.loginUser(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Logged in successfully',
    data: result
  });
});

const getMe = catchAsync(async (req, res) => {
  const result = await AuthService.getMe(req.user!.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile fetched successfully',
    data: result
  });
});

const logout = catchAsync(async (_req, res) => {
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Logged out successfully. Please discard the token on the client.'
  });
});

export const AuthController = {
  registerUser,
  loginUser,
  getMe,
  logout
};
