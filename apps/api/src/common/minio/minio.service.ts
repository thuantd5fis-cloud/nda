import { Injectable, Logger } from '@nestjs/common';
import { Client as MinioClient } from 'minio';
import { randomUUID } from 'crypto';
import { extname } from 'path';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly minioClient: MinioClient;
  private readonly bucketName = 'uploads';

  constructor() {
    this.minioClient = new MinioClient({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });

    this.initializeBucket();
  }

  private async initializeBucket() {
    try {
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Bucket ${this.bucketName} created successfully`);
      }

      // Ensure public read policy for objects under uploads/public/*
      const publicPolicy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucketName}/public/*`],
          },
        ],
      } as any;

      try {
        // MinIO requires a JSON string policy
        // @ts-ignore - method exists on MinIO client
        await (this.minioClient as any).setBucketPolicy(
          this.bucketName,
          JSON.stringify(publicPolicy),
        );
        this.logger.log('Public policy applied to uploads/public/*');
      } catch (policyErr) {
        this.logger.warn(`Could not set public policy on bucket ${this.bucketName}: ${policyErr}`);
      }
    } catch (error) {
      this.logger.error('Error initializing Minio bucket:', error);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'general'
  ): Promise<{
    fileName: string;
    storedName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
  }> {
    try {
      const fileExtension = extname(file.originalname);
      const storedName = `${randomUUID()}${fileExtension}`;
      const filePath = `${folder}/${storedName}`;

      // Upload to Minio
      await this.minioClient.putObject(
        this.bucketName,
        filePath,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        }
      );

      this.logger.log(`File uploaded successfully: ${filePath}`);

      return {
        fileName: decodeURIComponent(escape(file.originalname)), // Fix UTF-8 encoding
        storedName,
        filePath: `/${this.bucketName}/${filePath}`,
        fileSize: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      this.logger.error('Error uploading file to Minio:', error);
      throw new Error('Failed to upload file');
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      // Remove leading slash and bucket name from path
      const objectName = filePath.replace(`/${this.bucketName}/`, '');
      await this.minioClient.removeObject(this.bucketName, objectName);
      this.logger.log(`File deleted successfully: ${filePath}`);
    } catch (error) {
      this.logger.error('Error deleting file from Minio:', error);
      throw new Error('Failed to delete file');
    }
  }

  async getFileUrl(filePath: string, expiry: number = 24 * 60 * 60): Promise<string> {
    try {
      // Remove leading slash and bucket name from path
      const objectName = filePath.replace(`/${this.bucketName}/`, '');
      const url = await this.minioClient.presignedGetObject(
        this.bucketName,
        objectName,
        expiry
      );
      return url;
    } catch (error) {
      this.logger.error('Error generating file URL:', error);
      throw new Error('Failed to generate file URL');
    }
  }

  async getFileStream(filePath: string) {
    try {
      const objectName = filePath.replace(`/${this.bucketName}/`, '');
      return await this.minioClient.getObject(this.bucketName, objectName);
    } catch (error) {
      this.logger.error('Error getting file stream:', error);
      throw new Error('Failed to get file stream');
    }
  }
}
