import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(['user', 'admin'])
  @IsOptional()
  role?: string;

  @IsEnum(['active', 'disabled'])
  @IsOptional()
  accountStatus?: string;
}
