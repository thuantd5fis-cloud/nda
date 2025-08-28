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

    const user = await (this.prisma.user as any).create({
      data: {
        ...createUserDto,
        passwordHash: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        status: true,
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

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    location?: string;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { page = 1, limit = 10, search, role, status, location: _location } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
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

    if (status) {
      where.status = status;
    }

    const [users, total] = await Promise.all([
      (this.prisma.user as any).findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          fullName: true,
          status: true,
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
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await (this.prisma.user as any).findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          include: {
            role: true,
          },
        },
        posts: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        sessions: {
          select: {
            id: true,
            ip: true,
            userAgent: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
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
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const user = await (this.prisma.user as any).update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        fullName: true,
        status: true,
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

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user._count.posts > 0) {
      throw new BadRequestException('Cannot delete user with existing posts');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  async resetPassword(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: {
        passwordHash: hashedPassword,
      },
    });

    return { 
      message: 'Password reset successfully',
      tempPassword,
    };
  }

  async getStats() {
    const [totalUsers, activeUsers, verifiedUsers, adminUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({
        where: {
          userRoles: {
            some: {
              role: {
                name: 'admin',
              },
            },
          },
        },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      verifiedUsers,
      adminUsers,
    };
  }
}
