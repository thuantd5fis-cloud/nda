import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create new user' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('admin')
  @ApiOperation({ summary: 'Create admin user with roles' })
  async createAdmin(@Body() createUserDto: any) {
    const { roleNames, ...userData } = createUserDto;
    const result = await this.usersService.createAdmin(userData, roleNames);
    
    const response = {
      message: 'Admin user created successfully',
      user: result.user,
    } as any;

    // Only include temporaryPassword if one was generated
    if (result.tempPassword) {
      response.temporaryPassword = result.tempPassword;
    }
    
    return response;
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,

  ) {
    return this.usersService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      role,
      status,

    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics' })
  getStats() {
    return this.usersService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post(':id/reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  async resetPassword(@Param('id') id: string) {
    const result = await this.usersService.resetPassword(id);
    
    return {
      message: 'Password reset successfully',
      temporaryPassword: result.tempPassword,
    };
  }
}
