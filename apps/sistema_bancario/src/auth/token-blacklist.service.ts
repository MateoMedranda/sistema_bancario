import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class TokenBlacklistService implements OnModuleDestroy {
  private readonly redisClient: Redis;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    
    this.redisClient = new Redis({ host, port });
  }

  async revokeToken(jti: string, ttlInSeconds: number): Promise<void> {
    if (ttlInSeconds <= 0) return;
    // Guarda el jti en Redis con un TTL igual al tiempo de vida restante del token
    await this.redisClient.set(`revoked_token:${jti}`, 'true', 'EX', ttlInSeconds);
  }

  async isRevoked(jti: string): Promise<boolean> {
    try {
      const result = await this.redisClient.get(`revoked_token:${jti}`);
      return result === 'true';
    } catch {
      // Estrategia "Falla cerrado": En caso de caída de Redis, rechazamos la petición por seguridad.
      return true;
    }
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
  }
}