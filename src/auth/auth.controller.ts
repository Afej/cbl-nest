import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';
import { AuthGuard } from './guards/auth.guard';
import { AuthGuardRequest } from './guards/types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  authenticatedUser(@Request() req: AuthGuardRequest) {
    return req.user;
  }

  @UseGuards(AuthGuard)
  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  changePassword(
    @Request() req: AuthGuardRequest,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    const id = req.user._id as string;
    return this.authService.changePassword(id, currentPassword, newPassword);
  }
}
