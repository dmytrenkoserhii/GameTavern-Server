import * as Joi from 'joi';
import * as path from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';

import { DatabaseModule } from '@/modules/database/database.module';
import { ENV_VALIDATION } from '@/shared/constants';

const ENVIRONMENT = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ENVIRONMENT ? `.env.${ENVIRONMENT}` : '.env.development',
      validationSchema: Joi.object(ENV_VALIDATION),
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'public', 'locales'), // path to your locales directory
      serveRoot: '/locales', // this is the endpoint from where you can access the files
    }),
    DatabaseModule,
  ],
})
export class AppModule {}
