import httpStatus from 'http-status';
import { IUser } from '../users/user.interface';
import { User } from '../users/user.model';
import { AppError } from '../../utils/AppError';
import { signAccessToken, signRefreshToken } from '../../utils/jwt';

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

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

export const AuthService = {
  registerUser,
  loginUser,
  getMe
};
