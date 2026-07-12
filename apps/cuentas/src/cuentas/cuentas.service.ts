import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCuentaDto } from './dto/create-cuenta.dto';
import { UpdateCuentaDto } from './dto/update-cuenta.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cuenta } from './entities/cuenta.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CuentasService {
  
  constructor(
    @InjectRepository(Cuenta)
    private readonly cuentaRepository: Repository<Cuenta>,
  ) {}

  async create(createCuentaDto: CreateCuentaDto): Promise<Cuenta> {
    return this.cuentaRepository.save(createCuentaDto);
  }

  async findAll(): Promise<Cuenta[]> {
    return this.cuentaRepository.find({});
  }

  async findOne(id: string): Promise<Cuenta> {
    const cuenta = await this.cuentaRepository.findOneBy({ id });
    if (!cuenta) {
      throw new NotFoundException(`Cuenta with ID ${id} not found`);
    }
    return cuenta;
  }

  async update(id: string, updateCuentaDto: UpdateCuentaDto): Promise<Cuenta> {
    const cuenta = await this.findOne(id);
    this.cuentaRepository.merge(cuenta, updateCuentaDto);
    return this.cuentaRepository.save(cuenta);
  }

  async remove(id: string): Promise<Cuenta> {
    const cuenta = await this.findOne(id);
    return this.cuentaRepository.remove(cuenta);
  }
}