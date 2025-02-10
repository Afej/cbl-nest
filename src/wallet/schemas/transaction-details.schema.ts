import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from '../../user/schemas/user.schema';

@Schema()
export class TransactionDetails {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  from?: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  to?: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  made_by?: User;

  @Prop({ required: true })
  amount: number;

  @Prop()
  description?: string;

  @Prop({ default: true })
  success: boolean;
}

export const TransactionDetailsSchema =
  SchemaFactory.createForClass(TransactionDetails);
