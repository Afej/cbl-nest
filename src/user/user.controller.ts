import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  HttpStatus,
  Request,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { Role } from '../common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { AuthGuardRequest } from 'src/auth/guards/types';

@ApiTags('Admin/Users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Create new user (Admin only)' })
  @ApiCreatedResponse({
    description: 'User created successfully',
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiOkResponse({
    description: 'Users retrieved successfully',
    isArray: true,
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number,
    @Query('search') search?: string,
    @Query('role') role?: Role,
  ) {
    return this.userService.findAll({ page, limit, search, role });
  }
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiOkResponse({
    description: 'User retrieved successfully',
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @ApiOperation({ summary: 'Update user (Admin only)' })
  @ApiOkResponse({
    description: 'User updated successfully',
  })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiOkResponse({
    description: 'User deleted successfully',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Request() req: AuthGuardRequest) {
    const currentUserId = req.user._id.toString();

    return this.userService.remove(id, currentUserId);
  }
}
