export class CreateUsuarioDto {
  name: string;
  identityId: string;
  email: string;
  createdAt: Date;
  role: UserRole;
  twoFactorEnabled?: boolean;
  adminId?: string;
  ipAddress?: string;
}

export type UserRole = 'CLIENTE' | 'CAJERO' | 'AUDITOR' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';