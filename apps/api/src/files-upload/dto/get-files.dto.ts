import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsNumber, Min, Max, IsIn } from 'class-validator';

export class GetFilesDto {
  @ApiPropertyOptional({
    description: 'Page number (default: 1)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page (default: 20, max: 100)',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filter by file type',
    example: 'image',
    enum: ['image', 'video', 'document'],
  })
  @IsOptional()
  @IsIn(['image', 'video', 'document'])
  fileType?: string;

  @ApiPropertyOptional({
    description: 'Filter by public/private files',
    example: true,
  })
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional({
    description: 'Search by file name',
    example: 'my-video',
  })
  @IsOptional()
  search?: string;
}
