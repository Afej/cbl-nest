import { Types } from 'mongoose';
import { Wallet } from './schemas/wallet.schema';

export interface IWallet extends Wallet {
  _id: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}
