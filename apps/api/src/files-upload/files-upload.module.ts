import { Module } from '@nestjs/common';
import { FilesUploadService } from './files-upload.service';
import { FilesUploadController } from './files-upload.controller';
import { FilesController } from './files.controller';
import { MinioModule } from '../common/minio/minio.module';

@Module({
  imports: [MinioModule],
  controllers: [FilesUploadController, FilesController],
  providers: [FilesUploadService],
  exports: [FilesUploadService],
})
export class FilesUploadModule {}
