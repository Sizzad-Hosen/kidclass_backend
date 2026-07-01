import { NextFunction, Request, RequestHandler, Response } from 'express';
import { User } from '../modules/users/user.model';
import { UserRole } from '../modules/users/user.interface';
import { AppError } from '../utils/AppError';
import { verifyAccessToken } from '../utils/jwt';

const authenticateHandler = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(401, 'Authorization token is required');
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.userId).select('_id role isActive');

  if (!user || !user.isActive) {
    throw new AppError(401, 'User is not authorized');
  }

  req.user = {
    userId: user._id.toString(),
    role: user.role
  };

  next();
};

export const authenticate: RequestHandler = (req, res, next) => {
  Promise.resolve(authenticateHandler(req, res, next)).catch(next);
};

export const authorize =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(401, 'User is not authenticated');
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(403, 'You do not have permission to perform this action');
    }

    next();
  };
