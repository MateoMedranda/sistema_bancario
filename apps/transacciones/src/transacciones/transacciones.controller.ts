import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { TransaccionesService } from './transacciones.service';
import { CreateTransaccionDto } from './dto/create-transaccion.dto';

@Controller()
export class TransaccionesController {
  private readonly logger = new Logger(TransaccionesController.name);

  constructor(private readonly transaccionesService: TransaccionesService) {}

  @MessagePattern('create-transaccion')
  async create(dto: CreateTransaccionDto) {
    this.logger.log('Transacciones recibe peticion TCP del Gateway');
    return this.transaccionesService.create(dto);
  }

  @MessagePattern('find-all-transacciones')
  async findAll() {
    this.logger.log('Transacciones: findAll via TCP');
    return this.transaccionesService.findAll();
  }

  @MessagePattern('find-transaccion')
  async findOne(data: { id: string }) {
    this.logger.log(`Transacciones: findOne(${data.id}) via TCP`);
    return this.transaccionesService.findOne(data.id);
  }
}
