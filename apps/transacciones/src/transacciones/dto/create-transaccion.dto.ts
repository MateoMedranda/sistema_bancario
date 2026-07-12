export class CreateTransaccionDto {
  sourceAccountId?: string;
  destinationAccountId?: string;
  type: TransactionType;
  description?: string;
  amount: number;
  fee?: number;
  refCode: string;
  status: TransactionStatus;
  ipAddress: string;
}

export type TransactionType = 'DEPOSITO' | 'RETIRO' | 'TRANSFERENCIA';
export type TransactionStatus = 'SUCCESS' | 'FAILED';