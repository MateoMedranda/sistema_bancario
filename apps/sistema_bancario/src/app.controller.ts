import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  health() {
    return { status: 'ok', service: 'API Gateway', timestamp: new Date().toISOString() };
  }

  @Post('usuarios/evento')
  @HttpCode(HttpStatus.OK)
  publishUsuarioEvento(@Body() data: Record<string, any>) {
    return this.appService.publishUsuarioEvento(data);
  }
}
