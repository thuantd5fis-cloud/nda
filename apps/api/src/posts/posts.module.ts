import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PublicPostsController } from './public-posts.controller';
import { PostsService } from './posts.service';

@Module({
  controllers: [PostsController, PublicPostsController],
  providers: [PostsService],
})
export class PostsModule {}
