import httpStatus from 'http-status';
import { AppError } from '../../utils/AppError';
import { IUser, UserRole } from './user.interface';
import { User } from './user.model';

type UserListQuery = {
  search?: string;
  role?: string;
  status?: string;
  page?: string;
  limit?: string;
};

type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
};

type UpdateUserPayload = Partial<CreateUserPayload>;

const sanitizeUser = (user: IUser) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

const getUsers = async (query: UserListQuery = {}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  const filter: Record<string, unknown> = {};

  if (query.search?.trim()) {
    const escapedSearch = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { name: { $regex: escapedSearch, $options: 'i' } },
      { email: { $regex: escapedSearch, $options: 'i' } }
    ];
  }

  if (['student', 'admin', 'super_admin'].includes(query.role ?? '')) {
    filter.role = query.role;
  }

  if (query.status === 'active') filter.isActive = true;
  if (query.status === 'inactive') filter.isActive = false;

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter)
  ]);

  return {
    users: users.map((user) => sanitizeUser(user)),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit))
  };
};

const getUserById = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return sanitizeUser(user);
};

const createUser = async (payload: CreateUserPayload) => {
  const existingUser = await User.findOne({ email: payload.email });

  if (existingUser) {
    throw new AppError(httpStatus.CONFLICT, 'Email is already registered');
  }

  const user = await User.create(payload);
  return sanitizeUser(user);
};

const updateUser = async (userId: string, payload: UpdateUserPayload) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (payload.email && payload.email !== user.email) {
    const existingUser = await User.findOne({ email: payload.email });

    if (existingUser) {
      throw new AppError(httpStatus.CONFLICT, 'Email is already registered');
    }
  }

  if (payload.name !== undefined) user.name = payload.name;
  if (payload.email !== undefined) user.email = payload.email;
  if (payload.password !== undefined) user.password = payload.password;
  if (payload.role !== undefined) user.role = payload.role;
  if (payload.isActive !== undefined) user.isActive = payload.isActive;

  await user.save();
  return sanitizeUser(user);
};

const deleteUser = async (userId: string) => {
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return sanitizeUser(user);
};

export const UserService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
