import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('Cuentas');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'cuentas',
        protoPath: join(__dirname, '../../../proto/cuentas.proto'),
        url: `0.0.0.0:${process.env.CUENTAS_GRPC_PORT ?? 50052}`,
      },
    },
  );
  await app.listen();
  logger.log(
    `Microservicio Cuentas escuchando por gRPC en puerto ${process.env.CUENTAS_GRPC_PORT ?? 50052}`,
  );
}
void bootstrap();
