import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsDateString, Min } from 'class-validator';

export class CreateEventDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  venue?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxAttendees?: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  organizer?: string;

  @IsOptional()
  @IsString()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsBoolean()
  requiresRegistration?: boolean;

  @IsOptional()
  @IsDateString()
  registrationDeadline?: string;
}
