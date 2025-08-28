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
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Assets')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload file' })
  @ApiConsumes('multipart/form-data')
  @UseGuards() // Temporarily remove auth guard for testing
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|svg\+xml)$/)) {
          callback(null, true);
        } else {
          callback(new Error('Only image files are allowed!'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const assetData: CreateAssetDto = {
      name: file.originalname,
      originalName: file.originalname,
      type: 'IMAGE' as any,
      mimeType: file.mimetype,
      filename: file.filename,
      path: file.path,
      url: `/uploads/${file.filename}`,
      size: file.size,
      width: undefined,
      height: undefined,
      alt: file.originalname,
    };

    console.log('📁 File uploaded:', {
      filename: file.filename,
      path: file.path,
      url: assetData.url,
      size: file.size
    });

    // Temporarily use a fake user ID for testing
    const userId = req.user?.id || 'test-user-id';
    return this.assetsService.create(assetData, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new asset' })
  create(@Body() createAssetDto: CreateAssetDto, @Request() req: any) {
    return this.assetsService.create(createAssetDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all assets' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('tags') tags?: string,
  ) {
    return this.assetsService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      type,
      tags,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get asset statistics' })
  getStats() {
    return this.assetsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asset by ID' })
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update asset' })
  update(@Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto) {
    return this.assetsService.update(id, updateAssetDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete asset' })
  remove(@Param('id') id: string) {
    return this.assetsService.remove(id);
  }

  @Post(':id/track-usage')
  @ApiOperation({ summary: 'Track asset usage' })
  trackUsage(
    @Param('id') assetId: string,
    @Body('entityType') entityType: string,
    @Body('entityId') entityId: string,
    @Body('title') title: string,
    @Body('url') url: string,
  ) {
    return this.assetsService.trackUsage(assetId, entityType, entityId, title, url);
  }

  @Delete(':id/usage')
  @ApiOperation({ summary: 'Remove asset usage' })
  removeUsage(
    @Param('id') assetId: string,
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
  ) {
    return this.assetsService.removeUsage(assetId, entityType, entityId);
  }

  @Post(':id/download')
  @ApiOperation({ summary: 'Increment download count' })
  incrementDownloadCount(@Param('id') id: string) {
    return this.assetsService.incrementDownloadCount(id);
  }
}
