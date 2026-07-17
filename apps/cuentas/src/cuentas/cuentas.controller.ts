import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CuentasService } from './cuentas.service';

@Controller()
export class CuentasController {
  private readonly logger = new Logger(CuentasController.name);

  constructor(private readonly cuentasService: CuentasService) {}

  @GrpcMethod('CuentasService', 'ValidateCuenta')
  async validate(data: { id: string }) {
    this.logger.log(`Cuentas: validate-cuenta(${data.id}) via gRPC`);
    return this.cuentasService.validate(data.id);
  }

  @GrpcMethod('CuentasService', 'FindCuenta')
  async findOne(data: { id: string }) {
    this.logger.log(`Cuentas: find-cuenta(${data.id}) via gRPC`);
    return this.cuentasService.findOne(data.id);
  }

  @GrpcMethod('CuentasService', 'UpdateBalance')
  async updateBalance(data: { id: string; amount: number }) {
    this.logger.log(`Cuentas: update-balance(${data.id}, ${data.amount}) via gRPC`);
    return this.cuentasService.updateBalance(data.id, data.amount);
  }
}
