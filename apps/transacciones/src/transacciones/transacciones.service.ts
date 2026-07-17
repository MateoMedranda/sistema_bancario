import { Inject, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom, Observable } from 'rxjs';
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
  ) {}

  onModuleInit() {
    this.cuentasService = this.client.getService<CuentasServiceGrpc>('CuentasService');
  }

  async create(dto: CreateTransaccionDto): Promise<Transaccion> {
    this.logger.log(
      `Transacciones -> gRPC -> Cuentas (validar cuenta origen: ${dto.sourceAccountId})`,
    );

    const sourceAccount = await firstValueFrom(
      this.cuentasService.validateCuenta({ id: dto.sourceAccountId })
    ).catch((error) => {
      this.logger.error(`Error validando cuenta origen: ${error.message}`);
      throw new NotFoundException(
        `Cuenta de origen ${dto.sourceAccountId} no encontrada o inactiva`,
      );
    });

    if (!sourceAccount) {
      throw new NotFoundException(
        `Cuenta de origen ${dto.sourceAccountId} no encontrada o inactiva`,
      );
    }

    if (dto.type === 'TRANSFERENCIA' && dto.destinationAccountId) {
      this.logger.log('Validando cuenta destino via gRPC');
      const destAccount = await firstValueFrom(
        this.cuentasService.validateCuenta({
          id: dto.destinationAccountId,
        })
      ).catch((error) => {
        this.logger.error(`Error validando cuenta destino: ${error.message}`);
        throw new NotFoundException(
          `Cuenta de destino ${dto.destinationAccountId} no encontrada o inactiva`,
        );
      });

      if (!destAccount) {
        throw new NotFoundException(
          `Cuenta de destino ${dto.destinationAccountId} no encontrada o inactiva`,
        );
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
    return saved;
  }

  async findAll(): Promise<Transaccion[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<Transaccion> {
    const transaccion = await this.repo.findOneBy({ id });
    if (!transaccion) {
      throw new NotFoundException(`Transaccion con ID ${id} no encontrada`);
    }
    return transaccion;
  }
}
