import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class EventEmitterService {
  private readonly logger = new Logger(EventEmitterService.name);

  constructor(
    @Inject('USUARIOS_EVENT')
    private readonly usuariosClient: ClientProxy,
  ) {}

  emitUsuarioEvento(pattern: string, data: any): void {
    this.logger.log(`Emitiendo evento Redis: ${pattern}`);
    this.usuariosClient.emit(pattern, data);
  }
}
