import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from './users/user.module';
import { LoggerModule } from './loggers/logger.module';
import { CommentModule } from './comments/comment.module';
import { AssetModule } from './assets/asset.module';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { UploadModule } from './upload/upload.module';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalogs/catalog.module';
import { PasswordResetModule } from './auth/password-reset/password-reset.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    LoggerModule,
    CommentModule,
    AssetModule,
    UploadModule,
    AuthModule,
    CatalogModule,
    PasswordResetModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
