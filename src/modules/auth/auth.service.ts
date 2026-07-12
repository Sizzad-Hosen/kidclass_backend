import httpStatus from 'http-status';
import crypto from 'node:crypto';
import { IUser } from '../users/user.interface';
import { User } from '../users/user.model';
import { AppError } from '../../utils/AppError';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type ForgotPasswordPayload = {
  email: string;
};

type ResetPasswordPayload = {
  token: string;
  password: string;
};

type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

const PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES = 15;

const sanitizeUser = (user: IUser) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const registerUser = async (payload: RegisterPayload) => {
  const existingUser = await User.findOne({ email: payload.email });

  if (existingUser) {
    throw new AppError(httpStatus.CONFLICT, 'Email is already registered');
  }

  const user = await User.create({
    ...payload,
    role: 'student'
  });

  const jwtPayload = {
    userId: user._id.toString(),
    role: user.role
  };

  return {
    user: sanitizeUser(user),
    accessToken: signAccessToken(jwtPayload),
    refreshToken: signRefreshToken(jwtPayload)
  };
};

const loginUser = async (payload: LoginPayload) => {
  const user = await User.findOne({ email: payload.email }).select('+password');

  if (!user || !user.isActive) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  const isPasswordMatched = await user.comparePassword(payload.password);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  const jwtPayload = {
    userId: user._id.toString(),
    role: user.role
  };

  return {
    user: sanitizeUser(user),
    accessToken: signAccessToken(jwtPayload),
    refreshToken: signRefreshToken(jwtPayload)
  };
};

const getMe = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user || !user.isActive) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return sanitizeUser(user);
};

const hashResetToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

const forgotPassword = async (payload: ForgotPasswordPayload) => {
  const user = await User.findOne({ email: payload.email });

  if (!user || !user.isActive) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');

  user.passwordResetToken = hashResetToken(resetToken);
  user.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES * 60 * 1000);
  await user.save();

  return {
    resetToken,
    expiresInMinutes: PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES
  };
};

const resetPassword = async (payload: ResetPasswordPayload) => {
  const passwordResetToken = hashResetToken(payload.token);

  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: new Date() }
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user || !user.isActive) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid or expired reset token');
  }

  user.password = payload.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const jwtPayload = {
    userId: user._id.toString(),
    role: user.role
  };

  return {
    user: sanitizeUser(user),
    accessToken: signAccessToken(jwtPayload),
    refreshToken: signRefreshToken(jwtPayload)
  };
};

const changePassword = async (userId: string, payload: ChangePasswordPayload) => {
  const user = await User.findById(userId).select('+password');

  if (!user || !user.isActive) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isPasswordMatched = await user.comparePassword(payload.currentPassword);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Current password is incorrect');
  }

  user.password = payload.newPassword;
  await user.save();

  return { changed: true };
};

const refreshToken = async (token: string) => {
  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded.userId);

  if (!user || !user.isActive) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'User is not authorized');
  }

  const jwtPayload = {
    userId: user._id.toString(),
    role: user.role
  };

  return {
    accessToken: signAccessToken(jwtPayload),
    refreshToken: signRefreshToken(jwtPayload)
  };
};

export const AuthService = {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken
};
