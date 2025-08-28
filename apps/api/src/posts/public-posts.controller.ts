import {
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PostsService } from './posts.service';

@ApiTags('Landing Page API')
@Controller('public/posts')
export class PublicPostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get published posts for landing page',
    description: 'Retrieve paginated list of published posts. Can filter by category.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of published posts with pagination',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              slug: { type: 'string' },
              excerpt: { type: 'string', nullable: true },
              featuredImage: { type: 'string', nullable: true },
              publishedAt: { type: 'string', format: 'date-time' },
              author: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  fullName: { type: 'string' }
                }
              },
              categories: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' }
                  }
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
        }
      }
    }
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'categoryId', required: false, type: String, description: 'Filter by category ID' })
  async getNews(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.postsService.getNewsForLanding({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      categoryId,
    });
  }
}
