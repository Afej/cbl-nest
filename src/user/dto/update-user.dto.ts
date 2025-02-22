import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: "User's first name",
    example: 'John',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: "User's last name",
    example: 'Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: "User's email address",
    example: 'john.doe@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: "User's role in the system",
    enum: ['user', 'admin'],
    required: false,
  })
  @IsEnum(['user', 'admin'])
  @IsOptional()
  role?: string;

  @ApiProperty({
    description: 'Current status of user account',
    enum: ['active', 'disabled'],
    required: false,
  })
  @IsEnum(['active', 'disabled'])
  @IsOptional()
  accountStatus?: string;
}
