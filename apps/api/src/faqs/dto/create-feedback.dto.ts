import { IsEnum, IsOptional, IsString } from 'class-validator';

enum FeedbackType {
  HELPFUL = 'HELPFUL',
  NOT_HELPFUL = 'NOT_HELPFUL',
}

export class CreateFeedbackDto {
  @IsEnum(FeedbackType)
  type!: FeedbackType;

  @IsOptional()
  @IsString()
  comment?: string;
}
