import { Body, Controller, Get, Post, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SessionGuard } from './guards/session.guard';
import { CurrentUser, CurrentUserType } from './decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: CurrentUserType) {
    return this.authService.getProfile(user.id);
  }

  @Post('logout')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout user' })
  async logout(@CurrentUser() user: CurrentUserType) {
    return this.authService.logout(user.id);
  }

  @Patch('change-password')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @ApiOperation({ summary: 'Change user password' })
  async changePassword(
    @CurrentUser() user: CurrentUserType,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, changePasswordDto);
  }
}
