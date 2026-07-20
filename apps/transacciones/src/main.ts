import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { RpcExceptionsFilter } from '@contracts';

async function bootstrap() {
  const logger = new Logger('Transacciones');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: +(process.env.TRANSACCIONES_PORT ?? 4003),
      },
    },
  );
  app.useGlobalFilters(new RpcExceptionsFilter());
  await app.listen();
  logger.log(
    `Microservicio Transacciones escuchando por TCP en puerto ${process.env.TRANSACCIONES_PORT ?? 4003}`,
  );
}
void bootstrap();
