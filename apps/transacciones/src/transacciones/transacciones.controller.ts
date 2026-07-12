import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TransaccionesService } from './transacciones.service';
import { CreateTransaccionDto } from './dto/create-transaccion.dto';
import { UpdateTransaccionDto } from './dto/update-transaccion.dto';
import { Transaccion } from './entities/transaccion.entity';

@Controller('transacciones')
export class TransaccionesController {
  constructor(private readonly transaccionesService: TransaccionesService) {}

  @Post()
  create(@Body() createTransaccionDto: CreateTransaccionDto): Promise<Transaccion> {
    return this.transaccionesService.create(createTransaccionDto);
  }

  @Get()
  async findAll(): Promise<Transaccion[]> {
    return this.transaccionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Transaccion> {
    return this.transaccionesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTransaccionDto: UpdateTransaccionDto,
  ): Promise<Transaccion> {
    return this.transaccionesService.update(id, updateTransaccionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Transaccion> {
    return this.transaccionesService.remove(id);
  }
}