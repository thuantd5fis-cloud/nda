import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Feature modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { AssetsModule } from './assets/assets.module';
import { EventsModule } from './events/events.module';
import { MembersModule } from './members/members.module';
import { FAQsModule } from './faqs/faqs.module';
import { TestModule } from './test/test.module';
import { SettingsModule } from './settings/settings.module';
import { FilesUploadModule } from './files-upload/files-upload.module';
import { DigitalEraModule } from './digital-era/digital-era.module';
import { HomepageModule } from './homepage/homepage.module';

import { HeaderFooterModule } from './header-footer/header-footer.module';

// Common modules
import { PrismaModule } from './common/prisma/prisma.module';


@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),

    // Static files with CORS headers
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        setHeaders: (res, _path) => {
          res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET');
          res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        },
      },
    }),

    // Common modules
    PrismaModule,


    // Landing Page API modules (first for Swagger order)
    HomepageModule,
    HeaderFooterModule,

    // Feature modules
    AuthModule,
    UsersModule,
    PostsModule,
    CategoriesModule,
    TagsModule,
    AssetsModule,
    EventsModule,
    MembersModule,
    FAQsModule,
    TestModule,
    SettingsModule,
    FilesUploadModule,
    DigitalEraModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
