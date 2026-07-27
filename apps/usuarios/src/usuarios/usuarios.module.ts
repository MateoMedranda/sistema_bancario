import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { AuditLog } from './entities/audit-log.entity';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, AuditLog])],
  controllers: [UsuariosController],
  providers: [UsuariosService],
})
export class UsuariosModule {}
