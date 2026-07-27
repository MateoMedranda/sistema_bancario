import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { TokenBlacklistService } from '../token-blacklist.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
    private readonly blacklistService: TokenBlacklistService, // Inyección del servicio
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        'Token de autenticación faltante o inválido',
      );
    }

    try {
      const secret = this.configService.get<string>(
        'JWT_SECRET',
        'cambienme_por_un_secreto',
      );
      const payload = await this.jwtService.verifyAsync(token, {
        secret,
      });

      // Verificación en Redis antes de dar acceso
      if (payload.jti) {
        const isRevoked = await this.blacklistService.isRevoked(payload.jti);
        if (isRevoked) {
          throw new UnauthorizedException('El token ha sido revocado (sesión cerrada)');
        }
      }

      request['user'] = payload;
      request['token'] = token; // Guardamos el token en el request para uso en el controller
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token expirado o inválido');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}