import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { RpcExceptionsFilter } from '@contracts';

async function bootstrap() {
  const logger = new Logger('Usuarios');
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new RpcExceptionsFilter());

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.REDIS,
      options: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: +(process.env.REDIS_PORT ?? 6379),
      },
    },
    { inheritAppConfig: true },
  );

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
        queue: 'auditoria_queue',
        queueOptions: {
          durable: false,
        },
      },
    },
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();
  await app.listen(3001);

  logger.log(
    `Microservicio Usuarios escuchando eventos Redis en ${process.env.REDIS_HOST ?? 'localhost'}:${process.env.REDIS_PORT ?? 6379}`,
  );
  logger.log('Microservicio Usuarios escuchando cola RabbitMQ auditoria_queue');
}
void bootstrap();
