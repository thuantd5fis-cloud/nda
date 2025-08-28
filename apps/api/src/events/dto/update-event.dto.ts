import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsEnum } from 'class-validator';
import { CreateEventDto } from './create-event.dto';

enum EventStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}
