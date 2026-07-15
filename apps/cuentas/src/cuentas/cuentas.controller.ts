import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CuentasService } from './cuentas.service';

@Controller()
export class CuentasController {
  private readonly logger = new Logger(CuentasController.name);

  constructor(private readonly cuentasService: CuentasService) {}

  @MessagePattern('validate-cuenta')
  async validate(data: { id: string }) {
    this.logger.log(`Cuentas: validate-cuenta(${data.id}) via TCP`);
    return this.cuentasService.validate(data.id);
  }

  @MessagePattern('find-cuenta')
  async findOne(data: { id: string }) {
    this.logger.log(`Cuentas: find-cuenta(${data.id}) via TCP`);
    return this.cuentasService.findOne(data.id);
  }

  @MessagePattern('find-all-cuentas')
  async findAll() {
    this.logger.log('Cuentas: findAll via TCP');
    return this.cuentasService.findAll();
  }

  @MessagePattern('update-balance')
  async updateBalance(data: { id: string; amount: number }) {
    this.logger.log(`Cuentas: update-balance(${data.id}, ${data.amount}) via TCP`);
    return this.cuentasService.updateBalance(data.id, data.amount);
  }
}
