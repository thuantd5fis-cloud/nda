import { IsEmail, IsString, IsOptional, IsBoolean, IsArray, IsEnum } from 'class-validator';
import { UserStatus } from '@prisma/client';

export class CreateUserAdminDto {
  @IsEmail()
  email!: string;

  @IsString()
  fullName!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  mustChangePassword?: boolean;

  @IsArray()
  @IsString({ each: true })
  roleNames!: string[];

  @IsOptional()
  @IsString()
  password?: string;
}
