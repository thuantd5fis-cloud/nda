import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { GetFilesDto } from './dto/get-files.dto';

@Injectable()
export class FilesUploadService {
  constructor(private prisma: PrismaService) {}

  async getAllFilesUpload() {
    return await this.prisma.filesUpload.findMany({
      include: {
        uploader: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getFilesUploadByType(fileType: string) {
    return await this.prisma.filesUpload.findMany({
      where: { fileType },
      include: {
        uploader: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getFilesUploadById(id: string) {
    return await this.prisma.filesUpload.findUnique({
      where: { id },
      include: {
        uploader: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  async createFilesUpload(data: {
    fileName: string;
    storedName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    fileType: string;
    uploadedBy: string;
    isPublic?: boolean;
  }) {
    return await this.prisma.filesUpload.create({
      data,
      include: {
        uploader: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  async deleteFilesUpload(id: string) {
    return await this.prisma.filesUpload.delete({
      where: { id },
    });
  }

  async getVideoList() {
    return await this.prisma.filesUpload.findMany({
      where: { 
        fileType: 'video',
        isPublic: true,
      },
      select: {
        id: true,
        fileName: true,
        filePath: true,
        fileSize: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  private getMinioPublicBaseUrl(): string {
    const envUrl = process.env.MINIO_PUBLIC_URL;
    if (envUrl && envUrl.trim().length > 0) return envUrl;
    const host = process.env.MINIO_ENDPOINT || 'localhost';
    const port = process.env.MINIO_PORT || '9000';
    if (host.startsWith('http://') || host.startsWith('https://')) {
      return `${host}:${port}`;
    }
    return `http://${host}:${port}`;
  }

  private toPublicUrl(filePath?: string | null): string | null {
    if (!filePath) return null;
    const base = this.getMinioPublicBaseUrl();
    return `${base}${filePath}`;
  }

  async getFiles(query: GetFilesDto) {
    const { page = 1, limit = 20, fileType, isPublic, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filter by file type
    if (fileType) {
      where.fileType = fileType;
    }

    // Filter by public/private
    if (typeof isPublic === 'boolean') {
      where.isPublic = isPublic;
    }

    // Search by file name
    if (search) {
      where.OR = [
        { fileName: { contains: search, mode: 'insensitive' } },
        { storedName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [files, total] = await Promise.all([
      this.prisma.filesUpload.findMany({
        where,
        skip,
        take: limit,
        include: {
          uploader: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.filesUpload.count({ where }),
    ]);

    // Transform files with public URLs
    const transformedFiles = files.map(file => ({
      ...file,
      publicUrl: this.toPublicUrl(file.filePath),
      fileSizeFormatted: this.formatFileSize(file.fileSize),
    }));

    return {
      data: transformedFiles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalFiles: total,
        totalSize: files.reduce((sum, file) => sum + file.fileSize, 0),
        fileTypes: await this.getFileTypesSummary(where),
      },
    };
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private async getFileTypesSummary(baseWhere: any) {
    const fileTypes = await this.prisma.filesUpload.groupBy({
      by: ['fileType'],
      where: baseWhere,
      _count: {
        fileType: true,
      },
      _sum: {
        fileSize: true,
      },
    });

    return fileTypes.map(ft => ({
      type: ft.fileType,
      count: ft._count.fileType,
      totalSize: ft._sum.fileSize || 0,
      totalSizeFormatted: this.formatFileSize(ft._sum.fileSize || 0),
    }));
  }
}
