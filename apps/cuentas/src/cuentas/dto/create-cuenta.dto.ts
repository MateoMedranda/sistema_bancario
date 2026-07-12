export class CreateCuentaDto {
  userId: string;
  accountNumber: string;
  type: AccountType;
  balance: number;
  status: AccountStatus;
  createdAt: Date;
}

export type AccountType = 'AHORROS' | 'CORRIENTE' | 'INVERSION';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED';