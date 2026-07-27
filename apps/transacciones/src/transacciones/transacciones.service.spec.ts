import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RpcException } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';
import { TransaccionesService } from './transacciones.service';
import { Transaccion } from './entities/transaccion.entity';

describe('TransaccionesService (getCuentaBalance)', () => {
  let service: TransaccionesService;
  let mockCuentasServiceGrpc: any;

  beforeEach(async () => {
    mockCuentasServiceGrpc = {
      validateCuenta: jest.fn(),
      getAvailableBalance: jest.fn(),
    };

    const mockClientGrpc = {
      getService: jest.fn().mockReturnValue(mockCuentasServiceGrpc),
    };

    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
    };

    const mockClientProxy = {
      send: jest.fn(),
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransaccionesService,
        {
          provide: getRepositoryToken(Transaccion),
          useValue: mockRepository,
        },
        {
          provide: 'CUENTAS_SERVICE',
          useValue: mockClientGrpc,
        },
        {
          provide: 'AUDITORIA_SERVICE',
          useValue: mockClientProxy,
        },
        {
          provide: 'NOTIFICACION_SERVICE',
          useValue: mockClientProxy,
        },
      ],
    }).compile();

    service = module.get<TransaccionesService>(TransaccionesService);
    service.onModuleInit(); // Inicializa el cliente gRPC
  });

  it('debe obtener el saldo de una cuenta exitosamente (Caso OK)', async () => {
    const mockBalanceResponse = {
      id: 'uuid-cuenta-valida',
      accountNumber: '1234567890',
      balance: 1500.5,
      status: 'ACTIVE',
    };

    mockCuentasServiceGrpc.getAvailableBalance.mockReturnValue(of(mockBalanceResponse));

    const result = await service.getCuentaBalance('uuid-cuenta-valida');
    expect(result).toEqual(mockBalanceResponse);
    expect(mockCuentasServiceGrpc.getAvailableBalance).toHaveBeenCalledWith({ id: 'uuid-cuenta-valida' });
  });

  it('debe lanzar RpcException 400 si el ID es vacío', async () => {
    await expect(service.getCuentaBalance('   ')).rejects.toThrow(RpcException);
    try {
      await service.getCuentaBalance('   ');
    } catch (error: any) {
      expect(error.getError().statusCode).toBe(400);
      expect(error.getError().message).toContain('no puede estar vacío');
    }
  });

  it('debe traducir error 404 de gRPC (NOT_FOUND) a RpcException con status 404', async () => {
    const grpcError = {
      code: 5,
      details: 'Cuenta con ID uuid-inexistente no encontrada',
    };

    mockCuentasServiceGrpc.getAvailableBalance.mockReturnValue(throwError(() => grpcError));

    await expect(service.getCuentaBalance('uuid-inexistente')).rejects.toThrow(RpcException);
    try {
      await service.getCuentaBalance('uuid-inexistente');
    } catch (error: any) {
      expect(error.getError().statusCode).toBe(404);
      expect(error.getError().message).toContain('no encontrada');
    }
  });

  it('debe traducir error 400 de gRPC (INVALID_ARGUMENT) a RpcException con status 400', async () => {
    const grpcError = {
      code: 3,
      details: 'El ID de la cuenta debe ser un UUID válido',
    };

    mockCuentasServiceGrpc.getAvailableBalance.mockReturnValue(throwError(() => grpcError));

    await expect(service.getCuentaBalance('id-invalido')).rejects.toThrow(RpcException);
    try {
      await service.getCuentaBalance('id-invalido');
    } catch (error: any) {
      expect(error.getError().statusCode).toBe(400);
      expect(error.getError().message).toContain('UUID');
    }
  });

  it('debe traducir caída del microservicio Cuentas (UNAVAILABLE) a RpcException 503 controlada', async () => {
    const grpcError = {
      code: 14,
      details: 'Connect Failed',
    };

    mockCuentasServiceGrpc.getAvailableBalance.mockReturnValue(throwError(() => grpcError));

    await expect(service.getCuentaBalance('uuid-cuenta')).rejects.toThrow(RpcException);
    try {
      await service.getCuentaBalance('uuid-cuenta');
    } catch (error: any) {
      expect(error.getError().statusCode).toBe(503);
      expect(error.getError().message).toContain('no se encuentra disponible');
    }
  });
});
