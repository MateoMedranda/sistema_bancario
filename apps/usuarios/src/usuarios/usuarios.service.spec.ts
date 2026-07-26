import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { UsuariosService } from './usuarios.service';
import { Usuario } from './entities/usuario.entity';

describe('UsuariosService (Seeder automático y verificación Bcrypt)', () => {
  let service: UsuariosService;
  let mockRepository: any;

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockRepository,
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
      expect((user as any)?.passwordHash).toBeUndefined(); // No debe exponer el hash
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
});
