import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';

export class CreateTransaccionDto {
  @IsString()
  sourceAccountId: string;

  @IsString()
  @IsOptional()
  destinationAccountId?: string;

  @IsString()
  @IsIn(['DEPOSITO', 'RETIRO', 'TRANSFERENCIA'])
  type: 'DEPOSITO' | 'RETIRO' | 'TRANSFERENCIA';

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  amount: number;

  @IsString()
  refCode: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;
}
