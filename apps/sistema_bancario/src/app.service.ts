import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { EventEmitterService } from './events/event-emitter.service';
import { CreateTransaccionDto } from './dto/create-transaccion.dto';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @Inject('TRANSACCIONES_SERVICE')
    private readonly transaccionesClient: ClientProxy,
    private readonly eventEmitter: EventEmitterService,
  ) {}

  // ─── Camino SINCRONO (TCP chain) ───

  async createTransaccion(dto: CreateTransaccionDto) {
    this.logger.log('Gateway -> TCP -> Transacciones -> Cuentas (cadena sincrona)');
    return firstValueFrom(
      this.transaccionesClient.send('create-transaccion', dto),
    );
  }

  async findAllTransacciones() {
    this.logger.log('Gateway -> TCP -> Transacciones (findAll)');
    return firstValueFrom(
      this.transaccionesClient.send('find-all-transacciones', {}),
    );
  }

  async findTransaccion(id: string) {
    this.logger.log(`Gateway -> TCP -> Transacciones (findOne: ${id})`);
    return firstValueFrom(
      this.transaccionesClient.send('find-transaccion', { id }),
    );
  }

  // ─── Camino ASINCRONO (Redis events, emisor no bloquea) ───

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
