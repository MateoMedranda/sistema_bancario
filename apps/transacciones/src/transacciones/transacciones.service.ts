import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException, type ClientGrpc, type ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { lastValueFrom, Observable } from 'rxjs';
import { Transaccion } from './entities/transaccion.entity';
import { CreateTransaccionDto } from './dto/create-transaccion.dto';

interface CuentasServiceGrpc {
  validateCuenta(data: { id: string }): Observable<any>;
}

@Injectable()
export class TransaccionesService implements OnModuleInit {
  private readonly logger = new Logger(TransaccionesService.name);
  private cuentasService: CuentasServiceGrpc;

  constructor(
    @InjectRepository(Transaccion)
    private readonly repo: Repository<Transaccion>,
    @Inject('CUENTAS_SERVICE')
    private readonly client: ClientGrpc,
    @Inject('AUDITORIA_SERVICE')
    private readonly auditoriaClient: ClientProxy,
  ) {}

  onModuleInit() {
    this.cuentasService = this.client.getService<CuentasServiceGrpc>('CuentasService');
  }

  private async validarCuentaGrpc(id: string, label: string): Promise<any | null> {
    try {
      return await lastValueFrom(this.cuentasService.validateCuenta({ id }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error validando cuenta ${label}: ${message}`);
      return null;
    }
  }

  async create(dto: CreateTransaccionDto): Promise<Transaccion | { status: string; message: string }> {
    this.logger.log(
      `Transacciones -> gRPC -> Cuentas (validar cuenta origen: ${dto.sourceAccountId})`,
    );

    const sourceAccount = await this.validarCuentaGrpc(
      dto.sourceAccountId,
      'origen',
    );

    if (!sourceAccount) {
      return {
        status: 'FAILED',
        message: `Cuenta de origen ${dto.sourceAccountId} no encontrada o inactiva`,
      };
    }

    if (dto.type === 'TRANSFERENCIA' && dto.destinationAccountId) {
      this.logger.log('Validando cuenta destino via gRPC');
      const destAccount = await this.validarCuentaGrpc(
        dto.destinationAccountId,
        'destino',
      );

      if (!destAccount) {
        return {
          status: 'FAILED',
          message: `Cuenta de destino ${dto.destinationAccountId} no encontrada o inactiva`,
        };
      }
    }

    const transaccion = this.repo.create({
      ...dto,
      status: 'SUCCESS',
      fee: dto.fee ?? 0,
      ipAddress: dto.ipAddress ?? '127.0.0.1',
    });

    const saved = await this.repo.save(transaccion);
    this.logger.log(`Transaccion ${saved.id} creada exitosamente`);

    this.auditoriaClient.emit('auditar_transaccion', {
      transaccionId: saved.id,
      type: dto.type,
      sourceAccountId: dto.sourceAccountId,
      destinationAccountId: dto.destinationAccountId,
      amount: dto.amount,
      status: saved.status,
      createdAt: saved.createdAt,
    });

    return saved;
  }

  async findAll(): Promise<Transaccion[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<Transaccion> {
    const transaccion = await this.repo.findOneBy({ id });
    if (!transaccion) {
      throw new RpcException({
        statusCode: 404,
        message: `Transaccion con ID ${id} no encontrada`,
        error: 'Not Found',
      });
    }
    return transaccion;
  }
}
