import { IsString, IsOptional, IsNumber, IsArray, IsEnum, Min } from 'class-validator';

enum AssetType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  FILE = 'FILE',
  AUDIO = 'AUDIO',
  PDF = 'PDF',
}

export class CreateAssetDto {
  @IsString()
  name!: string;

  @IsString()
  originalName!: string;

  @IsEnum(AssetType)
  type!: AssetType;

  @IsString()
  mimeType!: string;

  @IsString()
  filename!: string;

  @IsString()
  path!: string;

  @IsString()
  url!: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsNumber()
  @Min(0)
  size!: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsString()
  alt?: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  metadata?: any;
}
