import { Injectable, Logger } from '@nestjs/common';
import { EventEmitterService } from './events/event-emitter.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly eventEmitter: EventEmitterService) {}

  publishUsuarioEvento(data: Record<string, any>) {
    this.logger.log('Gateway -> Redis -> Usuarios (evento asincrono, no bloquea)');
    this.eventEmitter.emitUsuarioEvento('usuario-evento', data);
    return {
      status: 'evento publicado',
      message: 'El evento fue publicado en Redis. El emisor no espera al consumidor.',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
