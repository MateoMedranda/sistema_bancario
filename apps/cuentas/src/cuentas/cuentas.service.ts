import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cuenta } from './entities/cuenta.entity';

@Injectable()
export class CuentasService {
  private readonly logger = new Logger(CuentasService.name);

  constructor(
    @InjectRepository(Cuenta)
    private readonly repo: Repository<Cuenta>,
  ) {}

  async findAll(): Promise<Cuenta[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<Cuenta> {
    const cuenta = await this.repo.findOneBy({ id });
    if (!cuenta) {
      throw new RpcException({
        statusCode: 404,
        message: `Cuenta con ID ${id} no encontrada`,
        error: 'Not Found',
      });
    }
    return cuenta;
  }

  async validate(id: string): Promise<Cuenta> {
    const cuenta = await this.repo.findOneBy({ id });
    if (!cuenta) {
      this.logger.warn(`Cuenta ${id} no encontrada`);
      throw new RpcException({
        statusCode: 404,
        message: `Cuenta ${id} no encontrada`,
        error: 'Not Found',
      });
    }
    if (cuenta.status !== 'ACTIVE') {
      this.logger.warn(`Cuenta ${id} esta inactiva (status: ${cuenta.status})`);
      throw new RpcException({
        statusCode: 409,
        message: `Cuenta ${id} esta inactiva`,
        error: 'Conflict',
      });
    }
    return cuenta;
  }

  async updateBalance(id: string, amount: number): Promise<Cuenta> {
    const cuenta = await this.validate(id);
    cuenta.balance = Number(cuenta.balance) + amount;
    cuenta.balance = Number(cuenta.balance.toFixed(2));
    return this.repo.save(cuenta);
  }
}
