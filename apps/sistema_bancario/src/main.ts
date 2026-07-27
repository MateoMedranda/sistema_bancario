import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

async function bootstrap() {
  // Inicializamos Sentry antes de crear la app NestJS
  Sentry.init({
    dsn: process.env.SENTRY_DSN || 'https://839472395ffb94c66b3af18ee6de3e1d@o4511580718759936.ingest.us.sentry.io/4511804580298752',
    tracesSampleRate: 1.0,
  });

  const logger = new Logger('Gateway');
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`API Gateway escuchando en http://localhost:${port}/api`);
}
bootstrap();