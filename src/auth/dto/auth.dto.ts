import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'User email',
    example: 'test@gmail.com',
    type: String,
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'test1234',
    type: String,
    required: true,
  })
  @IsString()
  password: string;
}

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'test1234',
    type: String,
    required: true,
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: 'New password',
    example: 'test1234',
    type: String,
    required: true,
  })
  @IsString()
  newPassword: string;
}

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}
