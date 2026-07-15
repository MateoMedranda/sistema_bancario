import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';

@Injectable()
export class UsuariosService {
  private readonly logger = new Logger(UsuariosService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly repo: Repository<Usuario>,
  ) {}

  async processEvento(data: Record<string, any>): Promise<void> {
    this.logger.log('Procesando evento de usuario de forma asincrona...');
    this.logger.log(
      `El consumidor NO bloquea al emisor. Evento procesado en background.`,
    );
    this.logger.log(`Contenido: ${JSON.stringify(data)}`);

    if (data.type === 'create' && data.name) {
      const usuario = this.repo.create({
        name: data.name,
        identityId: data.identityId ?? `${Date.now()}`,
        email: data.email ?? `${data.name}@bank.com`,
        role: data.role ?? 'CLIENTE',
        status: 'ACTIVE',
        twoFactorEnabled: false,
        adminId: data.adminId ?? 'system',
        ipAddress: data.ipAddress ?? '127.0.0.1',
      });
      await this.repo.save(usuario);
      this.logger.log(`Usuario ${usuario.name} creado via evento asincrono`);
    } else {
      this.logger.log('Evento recibido sin accion de persistencia especifica');
    }
  }
}
