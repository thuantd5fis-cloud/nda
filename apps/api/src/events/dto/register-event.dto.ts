import { IsString, IsEmail, IsOptional } from 'class-validator';

export class RegisterEventDto {
  @IsString()
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
