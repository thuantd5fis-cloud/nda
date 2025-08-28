import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FilesUploadService } from './files-upload.service';
import { GetFilesDto } from './dto/get-files.dto';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesUploadService: FilesUploadService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get files list with filtering and pagination',
    description: 'Retrieve paginated files from files_upload table. Can filter by fileType (image/video/document), isPublic, and search by filename.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of files with pagination and summary',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              fileName: { type: 'string' },
              storedName: { type: 'string' },
              filePath: { type: 'string' },
              publicUrl: { type: 'string', nullable: true },
              fileSize: { type: 'number' },
              fileSizeFormatted: { type: 'string' },
              mimeType: { type: 'string' },
              fileType: { type: 'string' },
              isPublic: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              uploader: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  fullName: { type: 'string' },
                  email: { type: 'string' }
                }
              }
            }
          }
        },
        pagination: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' }
          }
        },
        summary: {
          type: 'object',
          properties: {
            totalFiles: { type: 'number' },
            totalSize: { type: 'number' },
            fileTypes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  count: { type: 'number' },
                  totalSize: { type: 'number' },
                  totalSizeFormatted: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  })
  async getFiles(@Query() query: GetFilesDto) {
    return this.filesUploadService.getFiles(query);
  }
}
