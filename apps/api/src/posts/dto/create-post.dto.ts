import { IsString, IsOptional, IsBoolean, IsArray, IsEnum } from 'class-validator';

enum PostStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED',
}

export class CreatePostDto {
  @IsString()
  title!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsBoolean()
  allowComments?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  requireLogin?: boolean;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  locale?: string;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  featuredImage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  openGraph?: any;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];
}
