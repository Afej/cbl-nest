import { FilterQuery, Types } from 'mongoose';
import { Wallet } from './schemas/wallet.schema';
import { Transaction } from './schemas/transaction.schema';
import { TransactionType, TransactionStatus } from '../common';

export interface IWallet extends Wallet {
  _id: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: TransactionType;
  status?: TransactionStatus;
  search?: string;
  populateRelations?: boolean;
}

export interface GetUserTransactionsParams extends TransactionFilters {
  userId: string;
}

export type TransactionQueryFilters = FilterQuery<Transaction>;
