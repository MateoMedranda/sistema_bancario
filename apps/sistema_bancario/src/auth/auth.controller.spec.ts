import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';

describe('AuthController (POST /api/auth/login)', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'secreto-de-prueba-jwt',
          signOptions: { expiresIn: 3600, algorithm: 'HS256' },
        }),
      ],
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('debe retornar access_token y datos del usuario al autenticar exitosamente', async () => {
    const response = await controller.login({
      username: 'cliente',
      password: 'cliente123',
    });

    expect(response.access_token).toBeDefined();
    expect(response.token_type).toBe('Bearer');
    expect(response.expires_in).toBe(3600);
    expect(response.user.username).toBe('cliente');
    expect(response.user.role).toBe('CLIENTE');
  });
});
