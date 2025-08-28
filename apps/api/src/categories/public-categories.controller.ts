import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

@ApiTags('Landing Page API')
@Controller('public/categories')
export class PublicCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get categories for public landing page',
    description: 'Retrieve all active categories for public display'
  })
  @ApiResponse({ 
    status: 200,
    description: 'Categories retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'cat_123' },
              name: { type: 'string', example: 'Tin tức' },
              slug: { type: 'string', example: 'tin-tuc' },
              description: { type: 'string', example: 'Danh mục tin tức' },
              color: { type: 'string', example: '#3B82F6' },
              icon: { type: 'string', example: 'news' },
              sortOrder: { type: 'number', example: 0 },
              postCount: { type: 'number', example: 25 }
            }
          }
        }
      }
    }
  })
  async getCategories() {
    const categories = await this.categoriesService.getCategoriesForPublic();
    
    return {
      success: true,
      data: categories
    };
  }
}
