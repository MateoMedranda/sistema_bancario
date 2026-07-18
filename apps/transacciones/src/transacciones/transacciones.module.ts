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
          transport: Transport.GRPC,
          options: {
            package: 'cuentas',
            protoPath: require('path').join(__dirname, '../../../proto/cuentas.proto'),
            url: `${config.get<string>('SVC_CUENTAS_HOST', 'localhost')}:${config.get<number>('CUENTAS_GRPC_PORT', 50052)}`,
          },
        }),
      },
      {
        name: 'AUDITORIA_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL', 'amqp://localhost:5672')],
            queue: 'auditoria_queue',
            queueOptions: {
              durable: false,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [TransaccionesController],
  providers: [TransaccionesService],
})
export class TransaccionesModule {}
