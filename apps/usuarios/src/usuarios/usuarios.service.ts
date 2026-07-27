import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from './entities/usuario.entity';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class UsuariosService {
  private readonly logger = new Logger(UsuariosService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly repo: Repository<Usuario>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
  ) {}

  /**
   * Valida credenciales contra la base de datos de Postgres (UsuariosBDD).
   * Utiliza bcryptjs para verificar el hash salado.
   */
  async validateUserCredentials(usernameOrEmail: string, pass: string) {
    const user = await this.repo.findOne({
      where: [{ name: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (!user || !user.passwordHash) {
      return null;
    }

    const isMatch = bcrypt.compareSync(pass, user.passwordHash);
    if (!isMatch || user.status !== 'ACTIVE') {
      return null;
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async processEvento(data: Record<string, any>): Promise<void> {
    this.logger.log('Procesando evento de usuario de forma asincrona...');
    this.logger.log(
      `El consumidor NO bloquea al emisor. Evento procesado en background.`,
    );
    this.logger.log(`Contenido: ${JSON.stringify(data)}`);

    try {
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
      } else if (data.eventId) {
        const existente = await this.auditLogRepo.findOne({
          where: { eventId: data.eventId },
        });

        if (existente) {
          this.logger.warn(
            `Evento duplicado detectado (eventId: ${data.eventId}), descartado`,
          );
          return;
        }

        const log = this.auditLogRepo.create({
          eventId: data.eventId,
          transaccionId: data.transaccionId,
          type: data.type,
          amount: data.amount,
          status: data.status,
        });

        await this.auditLogRepo.save(log);
        this.logger.log(
          `Evento ${data.eventId} procesado e idempotentemente persistido en AuditLog`,
        );
      } else {
        this.logger.log('Evento recibido sin accion de persistencia especifica');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error al procesar evento asincrono: ${message}`, stack);
    }
  }
}
