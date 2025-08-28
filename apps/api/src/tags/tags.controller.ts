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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Tags')
@ApiBearerAuth('access-token')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new tag' })
  @UseGuards() // Temporarily remove auth guard for testing
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  @UseGuards() // Temporarily remove auth guard for testing
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('color') color?: string,
  ) {
    return this.tagsService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      color,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get tag statistics' })
  @UseGuards() // Temporarily remove auth guard for testing
  getStats() {
    return this.tagsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tag by ID' })
  @UseGuards() // Temporarily remove auth guard for testing
  findOne(@Param('id') id: string) {
    return this.tagsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tag' })
  @UseGuards() // Temporarily remove auth guard for testing
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagsService.update(id, updateTagDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete tag' })
  @UseGuards() // Temporarily remove auth guard for testing
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }
}
