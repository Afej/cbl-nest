import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto, UpdateUserDto } from './dto';
import { comparePassword, hashPassword } from '../common';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = hashPassword(createUserDto.password);

    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return user.save();
  }

  async findAll(populateRelations = true): Promise<User[]> {
    let query = this.userModel.find();

    if (populateRelations) {
      query = query.populate('wallet transactions');
    }

    return query.exec();
  }

  async findOne(id: string, populateRelations = true): Promise<User> {
    let query = this.userModel.findById(id);

    if (populateRelations) {
      query = query.populate('wallet transactions');
    }

    const user = await query.exec();
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
