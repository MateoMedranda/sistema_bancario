import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaccion } from './entities/transaccion.entity';
import { TransaccionesService } from './transacciones.service';
import { TransaccionesController } from './transacciones.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaccion]),
    ClientsModule.registerAsync([
      {
        name: 'CUENTAS_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get<string>('SVC_CUENTAS_HOST', 'localhost'),
            port: config.get<number>('SVC_CUENTAS_PORT', 4002),
          },
        }),
      },
    ]),
  ],
  controllers: [TransaccionesController],
  providers: [TransaccionesService],
})
export class TransaccionesModule {}
