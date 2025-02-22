import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { hashPassword } from '../encryption-helper';
import { ConfigService } from '@nestjs/config';
import { User } from '../../user/schemas/user.schema';

@Injectable()
export class SeederService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
  ) {}

  async seedAdmin() {
    try {
      const existingAdmin = await this.userModel.findOne({ role: 'admin' });

      if (existingAdmin) {
        console.log('Admin user already exists');
        return;
      }

      // Create the admin user
      const firstName = 'Main';
      const lastName = 'Admin';
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
      const adminPassword =
        this.configService.get<string>('ADMIN_PASSWORD') || 'admin123';

      const hashedPassword = hashPassword(adminPassword);
      const adminUser = new this.userModel({
        firstName,
        lastName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });

      await adminUser.save();
      console.log('Admin user created successfully');
    } catch (error) {
      console.error('Admin seeding failed:', error);
    }
  }
}
