import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto, UpdateUserDto } from './dto';
import { hashPassword, PaginatedResponse } from '../common';
import { Wallet } from '../wallet/schemas/wallet.schema';
import { FindAllUsersParams } from './types';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Wallet.name) private walletModel: Model<Wallet>,
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new BadRequestException('Failed to create user');
    }
  }

  async findAll({
    page = 1,
    limit = 10,
    populateRelations = true,
    search,
    role,
  }: FindAllUsersParams = {}): Promise<PaginatedResponse<User>> {
    const skip = (page - 1) * limit;

    const queryConditions: FilterQuery<User> = {};

    if (search) {
      queryConditions.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      queryConditions.role = role;
    }

    const query = this.userModel
      .find(queryConditions)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (populateRelations) {
      query
        .populate({ path: 'wallet', model: 'Wallet' })
        .populate({ path: 'transactions', model: 'Transaction' });
    }

    const total = await this.userModel.countDocuments(queryConditions);
    const users = await query.lean().exec();

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
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

  async remove(
    id: string,
    currentUserId: string,
  ): Promise<{ message: string }> {
    if (id === currentUserId) {
      throw new BadRequestException('Cannot delete your own account');
    }

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

    return {
      message: `User deleted successfully.`,
    };
  }
}
