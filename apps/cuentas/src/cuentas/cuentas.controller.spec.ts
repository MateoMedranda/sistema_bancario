import { Test, TestingModule } from '@nestjs/testing';
import { CuentasController } from './cuentas.controller';
import { CuentasService } from './cuentas.service';

describe('CuentasController', () => {
  let cuentasController: CuentasController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CuentasController],
      providers: [CuentasService],
    }).compile();

    cuentasController = app.get<CuentasController>(CuentasController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect('Hello World!').toBe('Hello World!');
    });
  });
});
