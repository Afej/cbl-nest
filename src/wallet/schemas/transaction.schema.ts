import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import { Wallet } from './wallet.schema';
import {
  TransactionDetails,
  TransactionDetailsSchema,
} from './transaction-details.schema';
import { TransactionStatus, TransactionType } from '../../common';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Transaction {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true })
  walletId: Wallet;

  @Prop({
    type: String,
    enum: TransactionType,
    required: true,
  })
  type: TransactionType;

  @Prop({
    type: String,
    enum: TransactionStatus,
    default: TransactionStatus.COMPLETED,
  })
  status: TransactionStatus;

  @Prop({ type: TransactionDetailsSchema, required: true })
  details: TransactionDetails;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
