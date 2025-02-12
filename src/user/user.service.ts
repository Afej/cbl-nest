import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto, UpdateUserDto } from './dto';
import { comparePassword, hashPassword, PaginatedResponse } from '../common';
import { Wallet } from 'src/wallet/schemas/wallet.schema';
import { IUser } from './types';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Wallet.name) private walletModel: Model<Wallet>,
    @InjectConnection() private connection: Connection,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    try {
      // Hash the password before saving
      const hashedPassword = hashPassword(createUserDto.password);
      const userWithHashedPassword = {
        ...createUserDto,
        password: hashedPassword,
      };

      const newUser = new this.userModel(userWithHashedPassword);
      await newUser.save();

      // Create wallet
      const wallet = new this.walletModel({
        userId: newUser._id,
      });
      await wallet.save();

      return newUser;
    } catch (error) {
      throw new BadRequestException('Failed to create user');
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    populateRelations = true,
  ): Promise<PaginatedResponse<IUser>> {
    const skip = (page - 1) * limit;

    const query = this.userModel.find();

    if (populateRelations) {
      query
        .populate({ path: 'wallet', model: 'Wallet' })
        .populate({ path: 'transactions', model: 'Transaction' });
    }

    const total = await this.userModel.countDocuments();
    const users = await query.skip(skip).limit(limit).lean().exec();

    const totalPages = Math.ceil(total / limit);

    return {
      data: users as unknown as IUser[],
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string, populateRelations = true): Promise<User> {
    const query = this.userModel.findById(id);

    if (populateRelations) {
      query.populate({ path: 'wallet', model: 'Wallet', select: 'balance' });
    }

    const user = await query.lean().exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .populate('wallet transactions');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async remove(id: string): Promise<void> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Handle cascading deletes
    await Promise.all([
      this.userModel.db.model('Wallet').deleteOne({ userId: user._id }),
      this.userModel.db.model('Transaction').deleteMany({ userId: user._id }),
    ]);

    await user.deleteOne();
  }
  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userModel.findById(id).select('+password');

    const payload = {
      password: currentPassword,
      hash: user?.password,
    };
    if (!user || !comparePassword(payload)) {
      throw new NotFoundException('Invalid credentials');
    }

    user.password = hashPassword(newPassword);
    await user.save();
  }
}
