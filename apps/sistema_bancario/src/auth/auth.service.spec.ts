import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService (Generación de JWT y Validación Segura)', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'secreto-de-prueba-jwt',
          signOptions: { expiresIn: 3600, algorithm: 'HS256' },
        }),
      ],
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('debe validar exitosamente credenciales correctas (usuario admin)', async () => {
      const user = await service.validateUser('admin', 'admin123');
      expect(user).toBeDefined();
      expect(user.username).toBe('admin');
      expect(user.role).toBe('ADMIN');
      expect(user.id).toBe('admin-uuid-0001');
    });

    it('debe validar exitosamente usando el correo electrónico (email)', async () => {
      const user = await service.validateUser('cliente@banco.com', 'cliente123');
      expect(user).toBeDefined();
      expect(user.username).toBe('cliente');
      expect(user.role).toBe('CLIENTE');
      expect(user.id).toBe('user-1');
    });

    it('debe lanzar UnauthorizedException al recibir una contraseña incorrecta (verificación timing-safe)', async () => {
      await expect(service.validateUser('admin', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('debe lanzar UnauthorizedException al recibir un usuario inexistente', async () => {
      await expect(service.validateUser('hacker', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('login', () => {
    it('debe generar y retornar un token JWT firmado de forma segura para credenciales válidas', async () => {
      const result = await service.login({ username: 'cliente', password: 'cliente123' });

      expect(result).toBeDefined();
      expect(result.access_token).toBeDefined();
      expect(result.token_type).toBe('Bearer');
      expect(result.expires_in).toBe(3600);
      expect(result.user).toEqual({
        id: 'user-1',
        username: 'cliente',
        email: 'cliente@banco.com',
        role: 'CLIENTE',
      });

      // Verificamos la firma y los reclamos (claims) contenidos en el token JWT
      const decoded = jwtService.verify(result.access_token);
      expect(decoded.sub).toBe('user-1');
      expect(decoded.username).toBe('cliente');
      expect(decoded.email).toBe('cliente@banco.com');
      expect(decoded.role).toBe('CLIENTE');
      expect(decoded.iss).toBe('sistema-bancario-gateway');
      expect(decoded.aud).toBe('sistema-bancario-clients');
      expect(decoded.jti).toBeDefined();
    });
  });
});
