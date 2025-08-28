import { Module } from '@nestjs/common';
import { DigitalEraController } from './digital-era.controller';
import { DigitalEraService } from './digital-era.service';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DigitalEraController],
  providers: [DigitalEraService],
  exports: [DigitalEraService],
})
export class DigitalEraModule {}
