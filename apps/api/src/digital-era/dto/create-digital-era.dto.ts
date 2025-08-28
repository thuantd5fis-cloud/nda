import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean, MinLength, MaxLength } from 'class-validator';

export class CreateDigitalEraDto {
  @ApiProperty({
    description: 'Quote content',
    example: 'Chuyển đổi số không chỉ là công nghệ, đó là thay đổi tư duy, quy trình và cách chúng ta tạo ra giá trị cho cộng đồng.',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Quote text must be at least 10 characters long' })
  @MaxLength(1000, { message: 'Quote text cannot exceed 1000 characters' })
  text!: string;

  @ApiProperty({
    description: 'Author or source of the quote',
    example: 'Nguyễn Minh An',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200, { message: 'Author name cannot exceed 200 characters' })
  author!: string;

  @ApiProperty({
    description: 'Display order',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiProperty({
    description: 'Whether the quote is active',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
