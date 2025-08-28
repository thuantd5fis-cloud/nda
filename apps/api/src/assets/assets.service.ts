import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async create(createAssetDto: CreateAssetDto, userId: string) {
    try {
      // If no valid user ID provided, use the first available user
      if (userId === 'test-user-id') {
        const firstUser = await this.prisma.user.findFirst();
        if (firstUser) {
          userId = firstUser.id;
        } else {
          throw new BadRequestException('No users found in database. Please create a user first.');
        }
      }

      const asset = await this.prisma.asset.create({
        data: {
          ...createAssetDto,
          createdBy: userId,
        },
        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              assetUsages: true,
            },
          },
        },
      });

      return asset;
    } catch (error) {
      console.error('Asset creation error:', error);
      throw new BadRequestException('Failed to create asset: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    tags?: string;
  }) {
    const { page = 1, limit = 10, search, type, tags } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { originalName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (tags) {
      where.tags = {
        hasSome: tags.split(','),
      };
    }

    const [assets, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        skip,
        take: limit,
        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              assetUsages: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.asset.count({ where }),
    ]);

    return {
      data: assets,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
        assetUsages: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            assetUsages: true,
          },
        },
      },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return asset;
  }

  async update(id: string, updateAssetDto: UpdateAssetDto) {
    const existingAsset = await this.prisma.asset.findUnique({
      where: { id },
    });

    if (!existingAsset) {
      throw new NotFoundException('Asset not found');
    }

    const asset = await this.prisma.asset.update({
      where: { id },
      data: updateAssetDto,
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            assetUsages: true,
          },
        },
      },
    });

    return asset;
  }

  async remove(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            assetUsages: true,
          },
        },
      },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    if (asset._count.assetUsages > 0) {
      throw new BadRequestException('Cannot delete asset that is being used');
    }

    await this.prisma.asset.delete({
      where: { id },
    });

    return { message: 'Asset deleted successfully' };
  }

  async trackUsage(assetId: string, entityType: string, entityId: string, title: string, url: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    // Check if usage already exists
    const existingUsage = await this.prisma.assetUsage.findFirst({
      where: {
        assetId,
        entityType,
        entityId,
      },
    });

    if (!existingUsage) {
      await this.prisma.assetUsage.create({
        data: {
          assetId,
          entityType,
          entityId,
          title,
          url,
        },
      });

      // Update usage count
      await this.prisma.asset.update({
        where: { id: assetId },
        data: {
          usageCount: {
            increment: 1,
          },
        },
      });
    }

    return { message: 'Usage tracked successfully' };
  }

  async removeUsage(assetId: string, entityType: string, entityId: string) {
    const usage = await this.prisma.assetUsage.findFirst({
      where: {
        assetId,
        entityType,
        entityId,
      },
    });

    if (usage) {
      await this.prisma.assetUsage.delete({
        where: { id: usage.id },
      });

      // Update usage count
      await this.prisma.asset.update({
        where: { id: assetId },
        data: {
          usageCount: {
            decrement: 1,
          },
        },
      });
    }

    return { message: 'Usage removed successfully' };
  }

  async incrementDownloadCount(id: string) {
    await this.prisma.asset.update({
      where: { id },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });

    return { message: 'Download count updated' };
  }

  async getStats() {
    const [totalAssets, totalSize, imageAssets, videoAssets, documentAssets] = await Promise.all([
      this.prisma.asset.count(),
      this.prisma.asset.aggregate({
        _sum: {
          size: true,
        },
      }),
      this.prisma.asset.count({ where: { type: 'IMAGE' } }),
      this.prisma.asset.count({ where: { type: 'VIDEO' } }),
      this.prisma.asset.count({ where: { type: 'FILE' } }),
    ]);

    return {
      totalAssets,
      totalSize: totalSize._sum.size || 0,
      imageAssets,
      videoAssets,
      documentAssets,
    };
  }
}
