import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import {
  CUENTAS_PACKAGE,
  getCuentasProtoPath,
  RpcExceptionsFilter,
} from '@contracts';

async function bootstrap() {
  const logger = new Logger('Cuentas');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: CUENTAS_PACKAGE,
        protoPath: getCuentasProtoPath(),
        url: `0.0.0.0:${process.env.CUENTAS_GRPC_PORT ?? 50052}`,
      },
    },
  );
  app.useGlobalFilters(new RpcExceptionsFilter());
  await app.listen();
  logger.log(
    `Microservicio Cuentas escuchando por gRPC en puerto ${process.env.CUENTAS_GRPC_PORT ?? 50052}`,
  );
}
void bootstrap();
