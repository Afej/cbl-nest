import {
  IsString,
  IsEmail,
  IsEnum,
  MinLength,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

  @IsEnum(['user', 'admin'])
  @IsOptional()
  role?: string;

  @IsEnum(['active', 'disabled'])
  @IsOptional()
  accountStatus?: string;
}
