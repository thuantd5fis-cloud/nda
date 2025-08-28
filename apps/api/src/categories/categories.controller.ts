import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Categories')
@ApiBearerAuth('access-token')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('test')
  @ApiOperation({ summary: 'Test endpoint without auth' })
  test() {
    return { message: 'Categories API is working!', timestamp: new Date().toISOString() };
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @UseGuards() // Temporarily remove auth guard for testing
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @UseGuards() // Temporarily remove auth guard for testing
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @UseGuards() // Temporarily remove auth guard for testing
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update category by ID' })
  @UseGuards() // Temporarily remove auth guard for testing
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category by ID' })
  @UseGuards() // Temporarily remove auth guard for testing
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
