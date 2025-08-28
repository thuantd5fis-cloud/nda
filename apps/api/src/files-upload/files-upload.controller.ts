import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FilesUploadService } from './files-upload.service';
// import { GetFilesDto } from './dto/get-files.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MinioService } from '../common/minio/minio.service';

@ApiTags('FilesUpload')
@Controller('files-upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FilesUploadController {
  constructor(
    private readonly filesUploadService: FilesUploadService,
    private readonly minioService: MinioService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all files upload' })
  @ApiResponse({ status: 200, description: 'Files upload retrieved successfully' })
  async getAllFilesUpload(@Query('type') type?: string) {
    if (type) {
      return await this.filesUploadService.getFilesUploadByType(type);
    }
    return await this.filesUploadService.getAllFilesUpload();
  }

  @Get('videos')
  @ApiOperation({ summary: 'Get all video files for selection' })
  @ApiResponse({ status: 200, description: 'Video files retrieved successfully' })
  async getVideoList() {
    return await this.filesUploadService.getVideoList();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get files upload by ID' })
  @ApiResponse({ status: 200, description: 'Files upload retrieved successfully' })
  async getFilesUploadById(@Param('id') id: string) {
    return await this.filesUploadService.getFilesUploadById(id);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file to Minio' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, callback) => {
        // Allow videos, images, and documents
        const allowedMimes = [
          'video/mp4',
          'video/avi',
          'video/mov',
          'video/wmv',
          'video/webm',
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        
        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('File type not allowed'), false);
        }
      },
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Determine file type and default folder (public by default for homepage/landing usage)
    let fileType = 'document';
    let folder = 'public/documents';
    
    if (file.mimetype.startsWith('video/')) {
      fileType = 'video';
      folder = 'public/videos';
    } else if (file.mimetype.startsWith('image/')) {
      fileType = 'image';
      folder = 'public/images';
    }

    // Debug user info
    console.log('Request user:', req.user);
    
    const userId = req.user?.userId || req.user?.id;
    if (!req.user || !userId) {
      throw new BadRequestException('User not authenticated');
    }

    // Upload to Minio
    const uploadResult = await this.minioService.uploadFile(file, folder);

    const fileData = {
      fileName: uploadResult.fileName,
      storedName: uploadResult.storedName,
      filePath: uploadResult.filePath,
      fileSize: uploadResult.fileSize,
      mimeType: uploadResult.mimeType,
      fileType,
      uploadedBy: userId,
      isPublic: true,
    };

    console.log('Creating file record with data:', fileData);
    
    try {
      const result = await this.filesUploadService.createFilesUpload(fileData);
      console.log('File record created successfully:', result.id);
      return result;
    } catch (error) {
      console.error('Error creating file record:', error);
      throw error;
    }
  }

  @Get(':id/url')
  @ApiOperation({ summary: 'Get file URL by ID' })
  @ApiResponse({ status: 200, description: 'File URL retrieved successfully' })
  async getFileUrl(@Param('id') id: string) {
    const file = await this.filesUploadService.getFilesUploadById(id);
    if (!file) {
      throw new BadRequestException('File not found');
    }
    
    // Generate public URL for Minio file
    const baseUrl = this.getMinioPublicBaseUrl();
    return { 
      id: file.id,
      fileName: file.fileName,
      url: `${baseUrl}${file.filePath}` 
    };
  }

  private getMinioPublicBaseUrl(): string {
    const envUrl = process.env.MINIO_PUBLIC_URL;
    if (envUrl && envUrl.trim().length > 0) return envUrl;
    const host = process.env.MINIO_ENDPOINT || 'localhost';
    const port = process.env.MINIO_PORT || '9000';
    // If host already includes protocol, use directly
    if (host.startsWith('http://') || host.startsWith('https://')) {
      return `${host}:${port}`;
    }
    return `http://${host}:${port}`;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a files upload' })
  @ApiResponse({ status: 200, description: 'Files upload deleted successfully' })
  async deleteFilesUpload(@Param('id') id: string) {
    return await this.filesUploadService.deleteFilesUpload(id);
  }
}
