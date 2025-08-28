import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class ReorderDigitalEraDto {
  @ApiProperty({
    description: 'Array of digital era quote IDs in new order',
    example: ['uuid1', 'uuid2', 'uuid3', 'uuid4'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one ID must be provided' })
  @IsString({ each: true })
  ids!: string[];
}
