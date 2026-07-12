import { Test, TestingModule } from '@nestjs/testing';
import { TransaccionesController } from './transacciones.controller';
import { TransaccionesService } from './transacciones.service';

describe('TransaccionesController', () => {
  let transaccionesController: TransaccionesController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TransaccionesController],
      providers: [TransaccionesService],
    }).compile();

    transaccionesController = app.get<TransaccionesController>(TransaccionesController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(transaccionesController.getHello()).toBe('Hello World!');
    });
  });
});
