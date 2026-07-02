import jwt, { SignOptions } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { env } from '../config/env';
import { UserRole } from '../modules/users/user.interface';

export type JwtPayload = {
  userId: string;
  role: UserRole;
};

export const signAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN
  } as SignOptions);
};

export const signRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN
  } as SignOptions);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
};

export const toObjectId = (id: string): Types.ObjectId => new Types.ObjectId(id);
