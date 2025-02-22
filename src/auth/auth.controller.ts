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
import { LoginDto, UpdatePasswordDto, UpdateProfileDto } from './dto';
import { AuthGuard } from './guards/auth.guard';
import { AuthGuardRequest } from './guards/types';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'User login' })
  @ApiOkResponse({
    description: 'Login successful',
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'Get authenticated user profile' })
  @ApiOkResponse({
    description: 'User profile retrieved successfully',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  authenticatedUser(@Request() req: AuthGuardRequest) {
    return req.user;
  }

  @ApiOperation({ summary: 'Change user password' })
  @ApiOkResponse({
    description: 'Password changed successfully',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  changePassword(
    @Request() req: AuthGuardRequest,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    const id = req.user._id.toString();
    return this.authService.changePassword(id, updatePasswordDto);
  }

  @ApiOperation({ summary: 'Update user profile' })
  @ApiOkResponse({
    description: 'Profile updated successfully',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch('update-profile')
  @HttpCode(HttpStatus.OK)
  updateProfile(
    @Request() req: AuthGuardRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const id = req.user._id.toString();
    return this.authService.updateUserProfile(id, updateProfileDto);
  }
}
