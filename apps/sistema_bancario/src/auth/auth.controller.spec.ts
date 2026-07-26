import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { of } from 'rxjs';

describe('AuthController (POST /api/auth/login)', () => {
  let controller: AuthController;
  let mockUsuariosClient: any;

  beforeEach(async () => {
    mockUsuariosClient = {
      send: jest.fn().mockReturnValue(
        of({
          id: 'user1',
          name: 'cliente',
          email: 'cliente@banco.com',
          role: 'CLIENTE',
          status: 'ACTIVE',
        }),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'secreto-de-prueba-jwt',
          signOptions: { expiresIn: 3600, algorithm: 'HS256' },
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: 'USUARIOS_SERVICE',
          useValue: mockUsuariosClient,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('debe retornar access_token y datos del usuario al autenticar exitosamente por BD', async () => {
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
