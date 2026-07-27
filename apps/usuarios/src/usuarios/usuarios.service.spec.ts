import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { UsuariosService } from './usuarios.service';
import { Usuario } from './entities/usuario.entity';
import { AuditLog } from './entities/audit-log.entity';

describe('UsuariosService (Seeder automático y verificación Bcrypt)', () => {
  let service: UsuariosService;
  let mockRepository: any;
  let mockAuditLogRepo: any;

  beforeEach(async () => {
    const defaultUser = {
      id: 'user1',
      name: 'cliente',
      email: 'cliente@banco.com',
      role: 'CLIENTE',
      status: 'ACTIVE',
      passwordHash: bcrypt.hashSync('cliente123', 10),
    };

    mockRepository = {
      findOne: jest.fn().mockImplementation(({ where }) => {
        if (
          Array.isArray(where) &&
          (where[0]?.name === 'cliente' || where[1]?.email === 'cliente')
        ) {
          return Promise.resolve(defaultUser);
        }
        if (where?.email === 'cliente@banco.com') {
          return Promise.resolve(defaultUser);
        }
        return Promise.resolve(null);
      }),
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockResolvedValue(true),
    };

    mockAuditLogRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockAuditLogRepo,
        },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUserCredentials (con Bcrypt salado)', () => {
    it('debe validar credenciales correctamente con hash bcrypt de 10 rondas', async () => {
      const user = await service.validateUserCredentials('cliente', 'cliente123');

      expect(user).toBeDefined();
      expect(user?.name).toBe('cliente');
      expect(user?.role).toBe('CLIENTE');
      expect((user as any)?.passwordHash).toBeUndefined();
    });

    it('debe retornar null ante una contraseña incorrecta', async () => {
      const user = await service.validateUserCredentials('cliente', 'clave_equivocada');

      expect(user).toBeNull();
    });

    it('debe retornar null si el usuario no existe en BD', async () => {
      const user = await service.validateUserCredentials('desconocido', '1234');

      expect(user).toBeNull();
    });
  });

  describe('processEvento - Idempotencia del consumidor asincrono', () => {
    it('debe persistir un evento nuevo en AuditLog cuando tiene eventId', async () => {
      mockAuditLogRepo.findOne.mockResolvedValue(null);

      await service.processEvento({
        eventId: 'evt-001',
        transaccionId: 'tx-001',
        type: 'DEPOSITO',
        amount: 100,
        status: 'SUCCESS',
      });

      expect(mockAuditLogRepo.findOne).toHaveBeenCalledWith({
        where: { eventId: 'evt-001' },
      });
      expect(mockAuditLogRepo.create).toHaveBeenCalledWith({
        eventId: 'evt-001',
        transaccionId: 'tx-001',
        type: 'DEPOSITO',
        amount: 100,
        status: 'SUCCESS',
      });
      expect(mockAuditLogRepo.save).toHaveBeenCalledTimes(1);
    });

    it('debe descartar un evento duplicado (mismo eventId)', async () => {
      mockAuditLogRepo.findOne.mockResolvedValue({
        eventId: 'evt-001',
        transaccionId: 'tx-001',
      });

      await service.processEvento({
        eventId: 'evt-001',
        transaccionId: 'tx-001',
        type: 'DEPOSITO',
        amount: 100,
        status: 'SUCCESS',
      });

      expect(mockAuditLogRepo.findOne).toHaveBeenCalledWith({
        where: { eventId: 'evt-001' },
      });
      expect(mockAuditLogRepo.create).not.toHaveBeenCalled();
      expect(mockAuditLogRepo.save).not.toHaveBeenCalled();
    });

    it('debe procesar dos eventos distintos (eventIds diferentes)', async () => {
      mockAuditLogRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      await service.processEvento({
        eventId: 'evt-001',
        transaccionId: 'tx-001',
        type: 'DEPOSITO',
        amount: 100,
        status: 'SUCCESS',
      });

      await service.processEvento({
        eventId: 'evt-002',
        transaccionId: 'tx-002',
        type: 'RETIRO',
        amount: 50,
        status: 'SUCCESS',
      });

      expect(mockAuditLogRepo.save).toHaveBeenCalledTimes(2);
    });

    it('debe procesar eventos de tipo create sin eventId (camino original)', async () => {
      await service.processEvento({
        type: 'create',
        name: 'nuevo_usuario',
        email: 'nuevo@test.com',
      });

      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });
});
