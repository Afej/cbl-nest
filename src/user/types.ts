import { Types } from 'mongoose';
import { User } from './schemas/user.schema';

export interface IUser extends User {
  _id: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

export type AuthenticatedUser = {
  token: string;
  user: Partial<IUser>;
};
