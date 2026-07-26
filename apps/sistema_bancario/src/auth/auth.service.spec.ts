import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AuthService } from './auth.service';

describe('AuthService (Validación por BD con TCP y Hashing con Sal)', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let mockUsuariosClient: any;

  beforeEach(async () => {
    mockUsuariosClient = {
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'secreto-de-prueba-jwt',
          signOptions: { expiresIn: 3600, algorithm: 'HS256' },
        }),
      ],
      providers: [
        AuthService,
        {
          provide: 'USUARIOS_SERVICE',
          useValue: mockUsuariosClient,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('debe validar exitosamente credenciales correctas recibiendo datos desde UsuariosBDD por TCP', async () => {
      mockUsuariosClient.send.mockReturnValue(
        of({
          id: 'user1',
          name: 'cliente',
          email: 'cliente@banco.com',
          role: 'CLIENTE',
          status: 'ACTIVE',
        }),
      );

      const user = await service.validateUser('cliente', 'cliente123');
      expect(user).toBeDefined();
      expect(user.username).toBe('cliente');
      expect(user.role).toBe('CLIENTE');
      expect(user.id).toBe('user1');
      expect(mockUsuariosClient.send).toHaveBeenCalledWith(
        { cmd: 'validate_user' },
        { usernameOrEmail: 'cliente', pass: 'cliente123' },
      );
    });

    it('debe lanzar UnauthorizedException cuando el microservicio BD retorna null (contraseña o usuario inválido)', async () => {
      mockUsuariosClient.send.mockReturnValue(of(null));

      await expect(service.validateUser('admin', 'wrongpass')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('debe lanzar UnauthorizedException ante error de conexión TCP con microservicio', async () => {
      mockUsuariosClient.send.mockReturnValue(
        throwError(() => new Error('Connection refused')),
      );

      await expect(service.validateUser('cliente', 'pass')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('login', () => {
    it('debe generar un token JWT firmado al obtener un usuario válido desde BD', async () => {
      mockUsuariosClient.send.mockReturnValue(
        of({
          id: 'user1',
          name: 'cliente',
          email: 'cliente@banco.com',
          role: 'CLIENTE',
          status: 'ACTIVE',
        }),
      );

      const result = await service.login({
        username: 'cliente',
        password: 'cliente123',
      });

      expect(result.access_token).toBeDefined();
      expect(result.token_type).toBe('Bearer');
      expect(result.expires_in).toBe(3600);
      expect(result.user).toEqual({
        id: 'user1',
        username: 'cliente',
        email: 'cliente@banco.com',
        role: 'CLIENTE',
      });

      const decoded = jwtService.verify(result.access_token);
      expect(decoded.sub).toBe('user1');
      expect(decoded.username).toBe('cliente');
      expect(decoded.email).toBe('cliente@banco.com');
      expect(decoded.role).toBe('CLIENTE');
    });
  });
});
