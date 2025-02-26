import { Types } from 'mongoose';
import { User } from './schemas/user.schema';
import { Role, AccountStatus } from '../common';

export interface IUser extends User {
  _id: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

export type AuthenticatedUser = {
  token: string;
  user: Partial<IUser>;
};

export interface FindAllUsersParams {
  page?: number;
  limit?: number;
  populateRelations?: boolean;
  search?: string;
  role?: Role;
  status?: AccountStatus;
}
