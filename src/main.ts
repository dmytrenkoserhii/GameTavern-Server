import cookieParser from 'cookie-parser';

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from '@/app.module';
import { ENV } from '@/shared/enums';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Config
  const configService = app.get(ConfigService);

  // Cookies
  app.use(cookieParser());

  // Validation
  app.useGlobalPipes(new ValidationPipe());

  // Security
  app.enableCors({
    origin: configService.get(ENV.CORS_ORIGIN, true), // It can't be * in case if we use http only cookies
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: configService.get(ENV.CORS_HEADERS, 'Content-Type, Accept, Authorization'),
    credentials: configService.get(ENV.CORS_CREDENTIALS, true),
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Auto Training')
    .setDescription('The Auto Training API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Run app
  const port = configService.get(ENV.PORT, 5050);
  await app.listen(port);
}

bootstrap();
