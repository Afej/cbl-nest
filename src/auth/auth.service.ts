import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { comparePassword, generateJwtToken, hashPassword } from '../common';
import { User } from '../user/schemas/user.schema';
import { LoginDto, UpdatePasswordDto, UpdateProfileDto } from './dto';
import { AuthenticatedUser } from '../user/types';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthenticatedUser> {
    const user = await this.userModel
      .findOne({ email: loginDto.email })
      .select('+password');

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const payload = {
      password: loginDto.password,
      hash: user.password,
    };

    if (!comparePassword(payload)) {
      throw new NotFoundException('Invalid credentials');
    }

    const secret = this.configService.get<string>('JWT_SECRET') as string;
    const id = user._id.toString();

    const token = generateJwtToken({
      id,
      secret,
    });

    // Json response removes password
    const userResponse = user.toJSON();

    return {
      token,
      user: userResponse,
    };
  }

  async getAuthUser(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate({
        path: 'wallet',
        model: 'Wallet',
        select: 'balance',
      })
      .lean();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async changePassword(
    id: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword } = updatePasswordDto;
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

    return { message: 'Password changed successfully' };
  }

  async updateUserProfile(
    userId: string,
    updateUserDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(userId, updateUserDto, {
      new: true,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
