import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiProperty({
    description: 'Settings category (general, security, email, etc.)',
    example: 'general'
  })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiProperty({
    description: 'Settings object with key-value pairs',
    example: {
      siteName: 'My CMS',
      siteUrl: 'https://example.com',
      adminEmail: 'admin@example.com'
    }
  })
  @IsObject()
  settings!: Record<string, any>;
}

export class UpdateSingleSettingDto {
  @ApiProperty({
    description: 'Settings category',
    example: 'general'
  })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiProperty({
    description: 'Setting key',
    example: 'siteName'
  })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty({
    description: 'Setting value',
    example: 'My CMS Website'
  })
  value: any;
}
