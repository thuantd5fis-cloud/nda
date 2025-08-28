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
} from '@nestjs/common';
import { FAQsService } from './faqs.service';
import { CreateFAQDto } from './dto/create-faq.dto';
import { UpdateFAQDto } from './dto/update-faq.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('faqs')
export class FAQsController {
  constructor(private readonly faqsService: FAQsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createFAQDto: CreateFAQDto, @Request() req: any) {
    return this.faqsService.create(createFAQDto, req.user.id);
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('isPublished') isPublished?: string,
    @Query('priority') priority?: number,
    @Query('tags') tags?: string,
  ) {
    return this.faqsService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      category,
      isPublished: isPublished === 'true' ? true : isPublished === 'false' ? false : undefined,
      priority: priority ? Number(priority) : undefined,
      tags,
    });
  }

  @Get('search')
  search(
    @Query('q') searchTerm: string,
    @Query('limit') limit?: number,
  ) {
    return this.faqsService.searchFAQs(
      searchTerm,
      limit ? Number(limit) : undefined,
    );
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  getStats() {
    return this.faqsService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.faqsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateFAQDto: UpdateFAQDto) {
    return this.faqsService.update(id, updateFAQDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.faqsService.remove(id);
  }

  @Post(':id/feedback')
  createFeedback(
    @Param('id') faqId: string,
    @Body() createFeedbackDto: CreateFeedbackDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id || null;
    return this.faqsService.createFeedback(faqId, userId, createFeedbackDto);
  }

  @Post('reorder')
  @UseGuards(JwtAuthGuard)
  reorderFAQs(@Body() reorderData: { id: string; order: number }[]) {
    return this.faqsService.reorderFAQs(reorderData);
  }
}
