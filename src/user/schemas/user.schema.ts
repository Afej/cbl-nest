import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AccountStatus, Role } from '../../common';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  id: false,
})
export class User {
  @Prop({ required: [true, 'Please add first name'] })
  firstName: string;

  @Prop({ required: [true, 'Please add last name'] })
  lastName: string;

  @Prop({
    required: [true, 'Please add an email'],
    unique: true,
  })
  email: string;

  @Prop({
    type: String,
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Prop({
    required: [true, 'Please add a password'],
    select: false,
  })
  password: string;

  @Prop({
    type: String,
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
  })
  accountStatus: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add virtuals for relationships
UserSchema.virtual('wallet', {
  ref: 'Wallet',
  localField: '_id',
  foreignField: 'userId',
  justOne: true,
});

UserSchema.virtual('transactions', {
  ref: 'Transaction',
  localField: '_id',
  foreignField: 'userId',
  justOne: false,
});

// Remove password when converting to JSON
UserSchema.set('toJSON', {
  transform: (_, ret) => {
    delete ret.password;
    return ret;
  },
});
