import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            createTransaccion: jest.fn(),
            findAllTransacciones: jest.fn(),
            findTransaccion: jest.fn(),
            publishUsuarioEvento: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return health status', () => {
      expect(appController.health()).toEqual(
        expect.objectContaining({
          status: 'ok',
          service: 'API Gateway',
        }),
      );
    });
  });
});
