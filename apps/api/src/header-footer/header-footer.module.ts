import { Module } from '@nestjs/common';
import { HeaderFooterController } from './header-footer.controller';
import { HeaderFooterService } from './header-footer.service';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HeaderFooterController],
  providers: [HeaderFooterService],
  exports: [HeaderFooterService], // Export service for potential use in other modules
})
export class HeaderFooterModule {}
