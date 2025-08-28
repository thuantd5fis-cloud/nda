import { Module } from '@nestjs/common';
import { FAQsController } from './faqs.controller';
import { FAQsService } from './faqs.service';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FAQsController],
  providers: [FAQsService],
  exports: [FAQsService],
})
export class FAQsModule {}
