import { PartialType } from '@nestjs/swagger';
import { CreateDigitalEraDto } from './create-digital-era.dto';

export class UpdateDigitalEraDto extends PartialType(CreateDigitalEraDto) {}
