import { Module } from '@nestjs/common';
import { CuentasController } from './cuentas.controller';
import { CuentasService } from './cuentas.service';

@Module({
  imports: [],
  controllers: [CuentasController],
  providers: [CuentasService],
})
export class CuentasModule {}
