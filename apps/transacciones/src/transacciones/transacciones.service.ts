import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransaccionDto } from './dto/create-transaccion.dto';
import { UpdateTransaccionDto } from './dto/update-transaccion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaccion } from './entities/transaccion.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TransaccionesService {
  
  constructor(
    @InjectRepository(Transaccion)
    private readonly transaccionRepository: Repository<Transaccion>,
  ) {}

  async create(createTransaccionDto: CreateTransaccionDto): Promise<Transaccion> {
    return this.transaccionRepository.save(createTransaccionDto);
  }

  async findAll(): Promise<Transaccion[]> {
    return this.transaccionRepository.find({});
  }

  async findOne(id: string): Promise<Transaccion> {
    const transaccion = await this.transaccionRepository.findOneBy({ id });
    if (!transaccion) {
      throw new NotFoundException(`Transaccion with ID ${id} not found`);
    }
    return transaccion;
  }

  async update(id: string, updateTransaccionDto: UpdateTransaccionDto): Promise<Transaccion> {
    const transaccion = await this.findOne(id);
    this.transaccionRepository.merge(transaccion, updateTransaccionDto);
    return this.transaccionRepository.save(transaccion);
  }

  async remove(id: string): Promise<Transaccion> {
    const transaccion = await this.findOne(id);
    return this.transaccionRepository.remove(transaccion);
  }
}