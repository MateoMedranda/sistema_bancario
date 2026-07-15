import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions, Logger } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Cuentas');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: +(process.env.CUENTAS_PORT ?? 4002),
      },
    },
  );
  await app.listen();
  logger.log(
    `Microservicio Cuentas escuchando por TCP en puerto ${process.env.CUENTAS_PORT ?? 4002}`,
  );
}
void bootstrap();
