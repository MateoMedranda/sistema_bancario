import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CuentasService } from './cuentas.service';
import { CreateCuentaDto } from './dto/create-cuenta.dto';
import { UpdateCuentaDto } from './dto/update-cuenta.dto';
import { Cuenta } from './entities/cuenta.entity';

@Controller('cuentas')
export class CuentasController {
  constructor(private readonly cuentasService: CuentasService) {}

  @Post()
  create(@Body() createCuentaDto: CreateCuentaDto): Promise<Cuenta> {
    return this.cuentasService.create(createCuentaDto);
  }

  @Get()
  async findAll(): Promise<Cuenta[]> {
    return this.cuentasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Cuenta> {
    return this.cuentasService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCuentaDto: UpdateCuentaDto,
  ): Promise<Cuenta> {
    return this.cuentasService.update(id, updateCuentaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Cuenta> {
    return this.cuentasService.remove(id);
  }
}