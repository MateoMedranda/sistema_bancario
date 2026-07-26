import {
  Injectable,
  UnauthorizedException,
  Logger,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { LoginDto } from './dto/login.dto';

export interface UserPayload {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'CLIENTE' | 'CAJERO' | 'AUDITOR';
  status: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    @Inject('USUARIOS_SERVICE')
    private readonly usuariosClient: ClientProxy,
  ) {}

  /**
   * Valida las credenciales del usuario en la base de datos (UsuariosBDD)
   * llamando por TCP al microservicio de Usuarios en tiempo real.
   */
  async validateUser(
    usernameOrEmail: string,
    pass: string,
  ): Promise<UserPayload> {
    let user: any;
    try {
      user = await firstValueFrom(
        this.usuariosClient.send(
          { cmd: 'validate_user' },
          { usernameOrEmail, pass },
        ),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error al consultar microservicio USUARIOS para autenticación BD: ${message}`,
      );
      throw new UnauthorizedException(
        'No se pudieron validar las credenciales en la base de datos',
      );
    }

    if (!user) {
      this.logger.warn(
        `Intento de login fallido en BD para usuario: ${usernameOrEmail}`,
      );
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.status !== 'ACTIVE') {
      this.logger.warn(
        `Intento de login para usuario inactivo/suspendido: ${usernameOrEmail}`,
      );
      throw new UnauthorizedException('El usuario no se encuentra activo');
    }

    return {
      id: user.id,
      username: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };
  }

  /**
   * Emite un token JWT firmado tras validar credenciales en BD
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
