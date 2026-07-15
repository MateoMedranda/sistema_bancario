import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CreateTransaccionDto } from './dto/create-transaccion.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  health() {
    return { status: 'ok', service: 'API Gateway', timestamp: new Date().toISOString() };
  }

  // ─── Camino SINCRONO (TCP: Gateway -> Transacciones -> Cuentas) ───

  @Post('transacciones')
  @HttpCode(HttpStatus.CREATED)
  createTransaccion(@Body() dto: CreateTransaccionDto) {
    return this.appService.createTransaccion(dto);
  }

  @Get('transacciones')
  findAllTransacciones() {
    return this.appService.findAllTransacciones();
  }

  @Get('transacciones/:id')
  findTransaccion(@Param('id') id: string) {
    return this.appService.findTransaccion(id);
  }

  // ─── Camino ASINCRONO (Redis: Gateway -> Usuarios, emisor no bloquea) ───

  @Post('usuarios/evento')
  @HttpCode(HttpStatus.OK)
  publishUsuarioEvento(@Body() data: Record<string, any>) {
    return this.appService.publishUsuarioEvento(data);
  }
}
