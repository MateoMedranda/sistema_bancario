import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';

describe('UsuariosController', () => {
  let usuariosController: UsuariosController;
  let usuariosService: UsuariosService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UsuariosController],
      providers: [
        {
          provide: UsuariosService,
          useValue: {
            processEvento: jest.fn(),
            validateUserCredentials: jest.fn().mockResolvedValue({
              id: 'user1',
              name: 'cliente',
              email: 'cliente@banco.com',
              role: 'CLIENTE',
              status: 'ACTIVE',
            }),
          },
        },
      ],
    }).compile();

    usuariosController = app.get<UsuariosController>(UsuariosController);
    usuariosService = app.get<UsuariosService>(UsuariosService);
  });

  it('should be defined', () => {
    expect(usuariosController).toBeDefined();
  });

  describe('handleValidateUser (TCP MessagePattern)', () => {
    it('debe validar credenciales llamando a usuariosService.validateUserCredentials', async () => {
      const result = await usuariosController.handleValidateUser({
        usernameOrEmail: 'cliente',
        pass: 'cliente123',
      });

      expect(usuariosService.validateUserCredentials).toHaveBeenCalledWith(
        'cliente',
        'cliente123',
      );
      expect(result).toEqual({
        id: 'user1',
        name: 'cliente',
        email: 'cliente@banco.com',
        role: 'CLIENTE',
        status: 'ACTIVE',
      });
    });
  });
});
