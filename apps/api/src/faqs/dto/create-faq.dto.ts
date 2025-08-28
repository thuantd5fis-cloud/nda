import { IsString, IsOptional, IsBoolean, IsArray, IsNumber, Min, Max } from 'class-validator';

export class CreateFAQDto {
  @IsString()
  question!: string;

  @IsString()
  answer!: string;

  @IsString()
  category!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  priority?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  searchKeywords?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}
