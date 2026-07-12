import { Module } from '@nestjs/common';
import { CuentasModule } from './cuentas/cuentas.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: +(configService.get<string>('DB_PORT') ?? 5432),
        database: configService.get<string>('DB_DATABASE_CUENTAS'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('DB_SYNCHRONIZE') === 'true',
      }),
    }),
    CuentasModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}