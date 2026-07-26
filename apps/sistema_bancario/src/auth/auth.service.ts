import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { LoginDto } from './dto/login.dto';

export interface UserPayload {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'CLIENTE' | 'CAJERO' | 'AUDITOR';
  status: string;
}

interface StoredUser {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'CLIENTE' | 'CAJERO' | 'AUDITOR';
  status: string;
  passwordHash: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly users: StoredUser[];

  constructor(private readonly jwtService: JwtService) {
    // Inicialización del almacén de usuarios en memoria con contraseñas hash SHA-256
    // Para el entorno bancario, almacenamos hash y comparamos de forma segura en tiempo constante.
    this.users = [
      {
        id: 'admin-uuid-0001',
        username: 'admin',
        email: 'admin@banco.com',
        role: 'ADMIN',
        status: 'ACTIVE',
        passwordHash: this.hashPassword('admin123'),
      },
      {
        id: 'user-1', // ID que coincide con el propietario de cuenta predeterminado en CuentasBDD
        username: 'cliente',
        email: 'cliente@banco.com',
        role: 'CLIENTE',
        status: 'ACTIVE',
        passwordHash: this.hashPassword('cliente123'),
      },
      {
        id: 'cajero-uuid-0001',
        username: 'cajero',
        email: 'cajero@banco.com',
        role: 'CAJERO',
        status: 'ACTIVE',
        passwordHash: this.hashPassword('cajero123'),
      },
      {
        id: 'auditor-uuid-0001',
        username: 'auditor',
        email: 'auditor@banco.com',
        role: 'AUDITOR',
        status: 'ACTIVE',
        passwordHash: this.hashPassword('auditor123'),
      },
    ];
  }

  /**
   * Genera hash SHA-256 de la contraseña
   */
  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  /**
   * Compara de forma segura dos hashes usando timingSafeEqual para prevenir ataques de canal lateral
   */
  private verifyPassword(inputPassword: string, storedHash: string): boolean {
    const inputHash = this.hashPassword(inputPassword);
    const inputBuffer = Buffer.from(inputHash, 'utf8');
    const storedBuffer = Buffer.from(storedHash, 'utf8');

    if (inputBuffer.length !== storedBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(inputBuffer, storedBuffer);
  }

  /**
   * Valida las credenciales del usuario (username o correo electrónico + contraseña)
   */
  async validateUser(usernameOrEmail: string, pass: string): Promise<UserPayload> {
    const user = this.users.find(
      (u) =>
        u.username.toLowerCase() === usernameOrEmail.toLowerCase() ||
        u.email.toLowerCase() === usernameOrEmail.toLowerCase(),
    );

    if (!user || !this.verifyPassword(pass, user.passwordHash)) {
      this.logger.warn(`Intento de login fallido para usuario: ${usernameOrEmail}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.status !== 'ACTIVE') {
      this.logger.warn(`Intento de login para usuario inactivo/suspendido: ${usernameOrEmail}`);
      throw new UnauthorizedException('El usuario no se encuentra activo');
    }

    // Retornamos el payload sin información sensible de contraseña
    const { passwordHash, ...userPayload } = user;
    return userPayload;
  }

  /**
   * Emite un token JWT firmado tras validar credenciales
   */
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);

    // Reclamaciones del estándar RFC 7519 + reclamos del dominio bancario
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      iss: 'sistema-bancario-gateway',
      aud: 'sistema-bancario-clients',
      jti: crypto.randomUUID(),
    };

    const accessToken = await this.jwtService.signAsync(payload);

    this.logger.log(
      `Token JWT emitido exitosamente para usuario [${user.username}] con rol [${user.role}] (jti: ${payload.jti})`,
    );

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600, // Por defecto 1 hora (estándar OAuth2/JWT)
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }
}
