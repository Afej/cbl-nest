import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { comparePassword, generateJwtToken } from 'src/common';
import { User } from 'src/user/schemas/user.schema';
import { LoginDto } from './dto';
import { AuthenticatedUser } from 'src/user/types';

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
    const id = user._id as unknown as string;

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
    const user = await this.userModel.findById(userId);

    // const user = await this.userModel.findById(userId).populate({
    //   path: 'wallet',
    //   select: 'balance',
    //   match: { userId }, // Only populate if wallet exists for the user
    // });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  logout() {
    // TODO: Implement logout logic
    // For now, just return a success message

    return {
      message: 'Logout successful',
    };
  }
}
