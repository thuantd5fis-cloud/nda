import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async create(createTagDto: CreateTagDto) {
    const existingTag = await this.prisma.tag.findFirst({
      where: {
        OR: [
          { name: createTagDto.name },
          { slug: createTagDto.slug },
        ],
      },
    });

    if (existingTag) {
      throw new BadRequestException('Tag name or slug already exists');
    }

    const tag = await this.prisma.tag.create({
      data: createTagDto,
      include: {
        _count: {
          select: {
            postTags: true,
          },
        },
      },
    });

    return tag;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    color?: string;
  }) {
    const { page = 1, limit = 100, search, isActive, color } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    if (color) {
      where.color = color;
    }

    const [tags, total] = await Promise.all([
      this.prisma.tag.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              postTags: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      }),
      this.prisma.tag.count({ where }),
    ]);

    return {
      data: tags,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        postTags: {
          include: {
            post: {
              select: {
                id: true,
                title: true,
                slug: true,
                status: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            post: {
              createdAt: 'desc',
            },
          },
        },
        _count: {
          select: {
            postTags: true,
          },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    const existingTag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      throw new NotFoundException('Tag not found');
    }

    // Check for duplicate name/slug if they're being updated
    if ((updateTagDto as any).name || (updateTagDto as any).slug) {
      const duplicateTag = await this.prisma.tag.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                (updateTagDto as any).name ? { name: (updateTagDto as any).name } : {},
                (updateTagDto as any).slug ? { slug: (updateTagDto as any).slug } : {},
              ].filter(condition => Object.keys(condition).length > 0),
            },
          ],
        },
      });

      if (duplicateTag) {
        throw new BadRequestException('Tag name or slug already exists');
      }
    }

    const tag = await this.prisma.tag.update({
      where: { id },
      data: updateTagDto,
      include: {
        _count: {
          select: {
            postTags: true,
          },
        },
      },
    });

    return tag;
  }

  async remove(id: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            postTags: true,
          },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (tag._count.postTags > 0) {
      throw new BadRequestException('Cannot delete tag that is being used by posts');
    }

    await this.prisma.tag.delete({
      where: { id },
    });

    return { message: 'Tag deleted successfully' };
  }

  async getStats() {
    const [totalTags, activeTags, totalUsage] = await Promise.all([
      this.prisma.tag.count(),
      this.prisma.tag.count({ where: { isActive: true } }),
      this.prisma.postTag.count(),
    ]);

    return {
      totalTags,
      activeTags,
      totalUsage,
    };
  }
}
