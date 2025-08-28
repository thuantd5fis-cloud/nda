import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../common/prisma/prisma.service';
import { PasswordService } from './services/password.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private passwordService: PasswordService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (user && await this.passwordService.comparePassword(password, user.passwordHash)) {
      // Check if password is expired
      if (this.passwordService.isPasswordExpired(user.passwordChangedAt)) {
        throw new UnauthorizedException('Password expired. Please change your password.');
      }

      // Check if user must change password
      if (user.mustChangePassword) {
        throw new UnauthorizedException('You must change your password before continuing.');
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      fullName: user.fullName,
      roles: user.userRoles.map((ur: any) => ur.role.name),
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    // Deactivate old sessions
    await this.prisma.session.updateMany({
      where: { userId: user.id },
      data: { isActive: false },
    });

    // Create new session
    await this.prisma.session.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        isActive: true,
      },
    });

    // Update login tracking
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        loginCount: { increment: 1 },
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roles: user.userRoles.map((ur: any) => ur.role.name),
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _passwordHash, ...result } = user;
    return result;
  }

  async logout(userId: string) {
    await this.prisma.session.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    return { message: 'Logged out successfully' };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New password and confirm password do not match');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.passwordService.comparePassword(
      currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await this.passwordService.hashPassword(newPassword);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedNewPassword,
        passwordChangedAt: new Date(),
        mustChangePassword: false,
      },
    });

    // Deactivate all sessions to force re-login
    await this.prisma.session.updateMany({
      where: { userId },
      data: { isActive: false },
    });

    return { message: 'Password changed successfully. Please login again.' };
  }

  async resetPassword(userId: string) {
    const tempPassword = this.passwordService.generateTemporaryPassword();
    const hashedPassword = await this.passwordService.hashPassword(tempPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPassword,
        passwordChangedAt: new Date(),
        mustChangePassword: true,
      },
    });

    // Deactivate all sessions
    await this.prisma.session.updateMany({
      where: { userId },
      data: { isActive: false },
    });

    return { 
      message: 'Password reset successfully',
      temporaryPassword: tempPassword 
    };
  }
}
