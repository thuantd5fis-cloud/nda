import { IsString, IsDateString, IsNumber, Min } from 'class-validator';

export class CreateMentoringDto {
  @IsString()
  menteeName!: string;

  @IsString()
  topic!: string;

  @IsDateString()
  date!: string;

  @IsNumber()
  @Min(15)
  duration!: number;
}
