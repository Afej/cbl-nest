import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsEnum,
  MinLength,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: "User's first name",
    example: 'John',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: "User's last name",
    example: 'Doe',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: "User's email address",
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "User's password - minimum 8 characters",
    example: 'password123',
    minLength: 8,
  })
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: "User's role in the system",
    enum: ['user', 'admin'],
    default: 'user',
    required: false,
  })
  @IsEnum(['user', 'admin'])
  @IsOptional()
  role?: string;

  @ApiProperty({
    description: 'Current status of user account',
    enum: ['active', 'disabled'],
    default: 'active',
    required: false,
  })
  @IsEnum(['active', 'disabled'])
  @IsOptional()
  accountStatus?: string;
}
