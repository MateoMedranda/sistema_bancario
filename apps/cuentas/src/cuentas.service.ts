import { Injectable } from '@nestjs/common';

@Injectable()
export class CuentasService {
  getHello(): string {
    return 'Hello World!';
  }
}
