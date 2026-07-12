import { Controller, Get } from '@nestjs/common';
import { CuentasService } from './cuentas.service';

@Controller()
export class CuentasController {
  constructor(private readonly cuentasService: CuentasService) {}

  @Get()
  getHello(): string {
    return this.cuentasService.getHello();
  }
}
