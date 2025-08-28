import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { CreateMentoringDto } from './dto/create-mentoring.dto';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async create(createMemberDto: CreateMemberDto) {
    const member = await this.prisma.member.create({
      data: {
        ...createMemberDto,
        joinDate: createMemberDto.joinDate ? new Date(createMemberDto.joinDate) : new Date(),
      },
      include: {
        mentoringHistory: {
          orderBy: {
            date: 'desc',
          },
          take: 5,
        },
      },
    });

    return member;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    expertise?: string;
    isExpert?: boolean;
    isActive?: boolean;
    location?: string;
  }) {
    const { page = 1, limit = 10, search, expertise, isExpert, isActive, location } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (expertise) {
      where.expertise = {
        hasSome: expertise.split(','),
      };
    }

    if (typeof isExpert === 'boolean') {
      where.isExpert = isExpert;
    }

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    const [members, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        skip,
        take: limit,
        include: {
          mentoringHistory: {
            select: {
              id: true,
              topic: true,
              date: true,
              status: true,
            },
            orderBy: {
              date: 'desc',
            },
            take: 3,
          },
          _count: {
            select: {
              mentoringHistory: true,
            },
          },
        },
        orderBy: [
          { isExpert: 'desc' },
          { experience: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      this.prisma.member.count({ where }),
    ]);

    return {
      data: members,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        mentoringHistory: {
          orderBy: {
            date: 'desc',
          },
        },
        _count: {
          select: {
            mentoringHistory: true,
          },
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  async update(id: string, updateMemberDto: UpdateMemberDto) {
    const existingMember = await this.prisma.member.findUnique({
      where: { id },
    });

    if (!existingMember) {
      throw new NotFoundException('Member not found');
    }

    const updateData: any = { ...updateMemberDto };

    if ((updateMemberDto as any).joinDate) {
      updateData.joinDate = new Date((updateMemberDto as any).joinDate);
    }

    const member = await this.prisma.member.update({
      where: { id },
      data: updateData,
      include: {
        mentoringHistory: {
          orderBy: {
            date: 'desc',
          },
          take: 5,
        },
        _count: {
          select: {
            mentoringHistory: true,
          },
        },
      },
    });

    return member;
  }

  async remove(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            mentoringHistory: true,
          },
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.articlesCount > 0 || member._count.mentoringHistory > 0) {
      throw new BadRequestException('Cannot delete member with existing articles or mentoring sessions');
    }

    await this.prisma.member.delete({
      where: { id },
    });

    return { message: 'Member deleted successfully' };
  }

  async createMentoringSession(memberId: string, createMentoringDto: CreateMentoringDto) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (!member.isExpert) {
      throw new BadRequestException('Only experts can provide mentoring');
    }

    const session = await this.prisma.mentoringSession.create({
      data: {
        mentorId: memberId,
        menteeName: createMentoringDto.menteeName,
        topic: createMentoringDto.topic,
        date: new Date(createMentoringDto.date),
        duration: createMentoringDto.duration,
      },
      include: {
        mentor: {
          select: {
            fullName: true,
            title: true,
          },
        },
      },
    });

    // Update mentoring count
    await this.prisma.member.update({
      where: { id: memberId },
      data: {
        mentoringCount: {
          increment: 1,
        },
      },
    });

    return session;
  }

  async getMentoringHistory(memberId: string, query: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;

    const where: any = { mentorId: memberId };

    if (status) {
      where.status = status;
    }

    const [sessions, total] = await Promise.all([
      this.prisma.mentoringSession.findMany({
        where,
        skip,
        take: limit,
        include: {
          mentor: {
            select: {
              fullName: true,
              title: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      }),
      this.prisma.mentoringSession.count({ where }),
    ]);

    return {
      sessions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateMentoringStatus(sessionId: string, status: string) {
    const session = await this.prisma.mentoringSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Mentoring session not found');
    }

    const updatedSession = await this.prisma.mentoringSession.update({
      where: { id: sessionId },
      data: { status: status as any },
      include: {
        mentor: {
          select: {
            fullName: true,
            title: true,
          },
        },
      },
    });

    return updatedSession;
  }

  async getStats() {
    const [totalMembers, totalExperts, activeMembers, totalMentoringSessions] = await Promise.all([
      this.prisma.member.count(),
      this.prisma.member.count({ where: { isExpert: true } }),
      this.prisma.member.count({ where: { isActive: true } }),
      this.prisma.mentoringSession.count(),
    ]);

    return {
      totalMembers,
      totalExperts,
      activeMembers,
      totalMentoringSessions,
    };
  }

  async syncWithCRM(memberId: string, crmData: any) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Simulate CRM sync
    const updatedMember = await this.prisma.member.update({
      where: { id: memberId },
      data: {
        crmId: crmData.crmId,
        // Update other fields from CRM
        updatedAt: new Date(),
      },
    });

    return updatedMember;
  }
}
