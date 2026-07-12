import { Controller, Get } from '@nestjs/common';
import { TransaccionesService } from './transacciones.service';

@Controller()
export class TransaccionesController {
  constructor(private readonly transaccionesService: TransaccionesService) {}

  @Get()
  getHello(): string {
    return this.transaccionesService.getHello();
  }
}
