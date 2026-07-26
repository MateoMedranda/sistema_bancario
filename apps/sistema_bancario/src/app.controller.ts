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
import { Public } from './auth/decorators/public.decorator';
import { Roles } from './auth/decorators/roles.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: 'API Gateway', timestamp: new Date().toISOString() };
  }

  // ─── Camino SINCRONO (TCP: Gateway -> Transacciones -> Cuentas) ───

  @Roles('CLIENTE', 'ADMIN', 'CAJERO')
  @Post('transacciones')
  @HttpCode(HttpStatus.CREATED)
  createTransaccion(@Body() dto: CreateTransaccionDto) {
    return this.appService.createTransaccion(dto);
  }

  @Roles('ADMIN', 'AUDITOR', 'CAJERO')
  @Get('transacciones')
  findAllTransacciones() {
    return this.appService.findAllTransacciones();
  }

  @Roles('CLIENTE', 'ADMIN', 'AUDITOR', 'CAJERO')
  @Get('transacciones/:id')
  findTransaccion(@Param('id') id: string) {
    return this.appService.findTransaccion(id);
  }

  // ─── Camino ASINCRONO (Redis: Gateway -> Usuarios, emisor no bloquea) ───

  @Roles('ADMIN')
  @Post('usuarios/evento')
  @HttpCode(HttpStatus.OK)
  publishUsuarioEvento(@Body() data: Record<string, any>) {
    return this.appService.publishUsuarioEvento(data);
  }
}
