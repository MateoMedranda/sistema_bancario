import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { UsuariosService } from './usuarios.service';

@Controller()
export class UsuariosController {
  private readonly logger = new Logger(UsuariosController.name);

  constructor(private readonly usuariosService: UsuariosService) {}

  @EventPattern('usuario-evento')
  async handleUsuarioEvento(@Payload() data: Record<string, any>) {
    this.logger.log('Usuarios: evento Redis recibido (consumidor asincrono)');
    this.logger.log(`Datos del evento: ${JSON.stringify(data)}`);
    return this.usuariosService.processEvento(data);
  }

  @EventPattern('auditar_transaccion')
  async handleAuditoriaTransaccion(@Payload() data: Record<string, any>) {
    this.logger.log('Usuarios: evento RabbitMQ recibido en auditoria_queue');
    this.logger.log(`Datos de auditoría: ${JSON.stringify(data)}`);
    return this.usuariosService.processEvento(data);
  }
}
