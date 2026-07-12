import { NestFactory } from '@nestjs/core';
import { TransaccionesModule } from './transacciones.module';

async function bootstrap() {
  const app = await NestFactory.create(TransaccionesModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
