import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password || 'temp123456', 10);

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        fullName: createUserDto.fullName,
        phone: createUserDto.phone,
        avatar: createUserDto.avatar,
        passwordHash: hashedPassword,
        status: createUserDto.isActive !== false ? 'ACTIVE' : 'INACTIVE',
        emailVerified: createUserDto.emailVerified || false,
        mustChangePassword: true,
        passwordChangedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatar: true,
        status: true,
        emailVerified: true,
        mustChangePassword: true,
        passwordChangedAt: true,
        lastLoginAt: true,
        loginCount: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          include: {
            role: true,
          },
        },
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    return user;
  }

  async createAdmin(createUserDto: any, roleNames: string[]) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException(`Email "${createUserDto.email}" đã được sử dụng`);
    }

    const transaction = await this.prisma.$transaction(async (prisma) => {
      let tempPassword = null;
      let hashedPassword: string;

      if (createUserDto.password) {
        // Use provided password
        hashedPassword = await bcrypt.hash(createUserDto.password, 12);
      } else {
        // Generate temporary password
        tempPassword = this.generateTemporaryPassword();
        hashedPassword = await bcrypt.hash(tempPassword, 12);
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          email: createUserDto.email,
          fullName: createUserDto.fullName,
          phone: createUserDto.phone,
          avatar: createUserDto.avatar,
          status: createUserDto.status || 'ACTIVE',
          emailVerified: createUserDto.emailVerified || false,
          mustChangePassword: createUserDto.password ? 
            (createUserDto.mustChangePassword || false) : true,
          passwordHash: hashedPassword,
          passwordChangedAt: new Date(),
        },
      });

      // Assign roles
      const roles = await prisma.role.findMany({
        where: { name: { in: roleNames } },
      });

      if (roles.length !== roleNames.length) {
        throw new BadRequestException('Some roles not found');
      }

      await Promise.all(
        roles.map(role =>
          prisma.userRole.create({
            data: {
              userId: user.id,
              roleId: role.id,
            },
          })
        )
      );

      return { user, tempPassword };
    });

    return transaction;
  }

  async resetPassword(userId: string) {
    const tempPassword = this.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

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

    return { tempPassword };
  }

  private generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&';
    let result = '';
    
    // Ensure at least one character from each required category
    result += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    result += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    result += '0123456789'[Math.floor(Math.random() * 10)];
    result += '@$!%*?&'[Math.floor(Math.random() * 7)];
    
    // Fill the rest randomly
    for (let i = 4; i < 12; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    
    // Shuffle the result
    return result.split('').sort(() => Math.random() - 0.5).join('');
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }) {
    const { page = 1, limit = 10, search, role, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (role) {
      where.userRoles = {
        some: {
          role: {
            name: role,
          },
        },
      };
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          avatar: true,
          status: true,
          emailVerified: true,
          lastLoginAt: true,
          loginCount: true,
          createdAt: true,
          updatedAt: true,
          userRoles: {
            include: {
              role: true,
            },
          },
          _count: {
            select: {
              posts: true,
              sessions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatar: true,
        status: true,
        emailVerified: true,
        mustChangePassword: true,
        passwordChangedAt: true,
        lastLoginAt: true,
        loginCount: true,
        createdAt: true,
        updatedAt: true,
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
        _count: {
          select: {
            posts: true,
            sessions: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        fullName: updateUserDto.fullName,
        phone: updateUserDto.phone,
        avatar: updateUserDto.avatar,
        status: updateUserDto.status,
        emailVerified: updateUserDto.emailVerified,
        mustChangePassword: updateUserDto.mustChangePassword,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatar: true,
        status: true,
        emailVerified: true,
        mustChangePassword: true,
        passwordChangedAt: true,
        lastLoginAt: true,
        loginCount: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          include: {
            role: true,
          },
        },
        _count: {
          select: {
            posts: true,
            sessions: true,
          },
        },
      },
    });

    return updatedUser;
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  async getStats() {
    const [totalUsers, activeUsers, suspendedUsers, recentUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { status: 'SUSPENDED' } }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      suspendedUsers,
      recentUsers,
    };
  }
}