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
  // Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser, CurrentUserType } from '../auth/decorators/current-user.decorator';

@ApiTags('Posts')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new post' })
  @RequirePermissions('posts:create')
  create(@Body() createPostDto: CreatePostDto, @CurrentUser() user: CurrentUserType) {
    return this.postsService.create(createPostDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  @RequirePermissions('posts:read')
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('categoryId') categoryId?: string,
    @Query('tagId') tagId?: string,
    @Query('authorId') authorId?: string,
    @Query('featured') featured?: string,
  ) {
    return this.postsService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      status,
      categoryId,
      tagId,
      authorId,
      featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get post statistics' })
  getStats() {
    return this.postsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get post analytics' })
  getAnalytics(
    @Param('id') id: string,
    @Query('days') days?: number,
  ) {
    return this.postsService.getAnalytics(id, days ? Number(days) : undefined);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update post' })
  @RequirePermissions('posts:update')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.postsService.update(id, updatePostDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete post' })
  @RequirePermissions('posts:delete')
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }

  // Workflow endpoints
  @Post(':id/submit-review')
  @ApiOperation({ summary: 'Submit post for review' })
  @RequirePermissions('posts:submit-review')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Post submitted for review successfully' })
  submitForReview(@Param('id') id: string, @CurrentUser() user: CurrentUserType) {
    return this.postsService.submitForReview(id, user.id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve post and move to published' })
  @RequirePermissions('posts:approve')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Post approved and published successfully' })
  approvePost(@Param('id') id: string, @CurrentUser() user: CurrentUserType) {
    return this.postsService.approvePost(id, user.id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject post' })
  @RequirePermissions('posts:reject')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Post rejected successfully' })
  rejectPost(
    @Param('id') id: string, 
    @Body() body: { reason?: string },
    @CurrentUser() user: CurrentUserType
  ) {
    return this.postsService.rejectPost(id, user.id, body.reason);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive post' })
  @RequirePermissions('posts:archive')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Post archived successfully' })
  archivePost(@Param('id') id: string, @CurrentUser() user: CurrentUserType) {
    return this.postsService.archivePost(id, user.id);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Directly publish post (bypass review)' })
  @RequirePermissions('posts:publish')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Post published successfully' })
  publishPost(@Param('id') id: string, @CurrentUser() user: CurrentUserType) {
    return this.postsService.publishPost(id, user.id);
  }
}
