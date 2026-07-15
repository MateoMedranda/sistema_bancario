import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { UsuariosService } from './usuarios.service';

@Controller()
export class UsuariosController {
  private readonly logger = new Logger(UsuariosController.name);

  constructor(private readonly usuariosService: UsuariosService) {}

  @EventPattern('usuario-evento')
  async handleUsuarioEvento(@Payload() data: Record<string, any>) {
    this.logger.log('Usuarios: evento Redis recibido');
    try {
      return await this.usuariosService.processEvento(data);
    } catch (error) {
      this.logger.error(`Error procesando evento: ${error.message}`);
    }
  }
}
