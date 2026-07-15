import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions, Logger } from '@nestjs/microservices';
import { AppModule } from './app.module';

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
  await app.listen();
  logger.log(
    `Microservicio Transacciones escuchando por TCP en puerto ${process.env.TRANSACCIONES_PORT ?? 4003}`,
  );
}
void bootstrap();
