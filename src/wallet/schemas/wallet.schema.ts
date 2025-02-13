import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../user/schemas/user.schema';

export type WalletDocument = HydratedDocument<Wallet>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  id: false,
})
export class Wallet {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ required: true, default: 0, min: 0 })
  balance: number;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);

WalletSchema.virtual('transactions', {
  ref: 'Transaction',
  localField: '_id',
  foreignField: 'walletId',
  justOne: false,
});
