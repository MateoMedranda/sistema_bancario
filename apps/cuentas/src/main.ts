import { NestFactory } from '@nestjs/core';
import { CuentasModule } from './cuentas.module';

async function bootstrap() {
  const app = await NestFactory.create(CuentasModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
