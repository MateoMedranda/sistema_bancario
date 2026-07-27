import { JwtAuthGuard } from './jwt-auth.guard';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtServiceMock: any;
  let configServiceMock: any;
  let reflectorMock: any;
  let blacklistServiceMock: any;

  beforeEach(() => {
    jwtServiceMock = {
      verifyAsync: jest.fn(),
    };
    configServiceMock = {
      get: jest.fn().mockReturnValue('secret_test'),
    };
    reflectorMock = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    };
    blacklistServiceMock = {
      isRevoked: jest.fn(),
    };

    guard = new JwtAuthGuard(
      jwtServiceMock,
      configServiceMock,
      reflectorMock,
      blacklistServiceMock,
    );
  });

  it('debe permitir la petición si el token es válido y NO está revocado', async () => {
    const mockPayload = { sub: 'user-1', jti: 'jti-valido-123' };
    jwtServiceMock.verifyAsync.mockResolvedValue(mockPayload);
    blacklistServiceMock.isRevoked.mockResolvedValue(false);

    const mockContext: any = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer token.valido.jwt' },
        }),
      }),
    };

    const canActivate = await guard.canActivate(mockContext);
    expect(canActivate).toBe(true);
    expect(blacklistServiceMock.isRevoked).toHaveBeenCalledWith('jti-valido-123');
  });

  it('debe lanzar UnauthorizedException si el token está en la lista de revocados', async () => {
    const mockPayload = { sub: 'user-1', jti: 'jti-revocado-999' };
    jwtServiceMock.verifyAsync.mockResolvedValue(mockPayload);
    blacklistServiceMock.isRevoked.mockResolvedValue(true); // Token revocado

    const mockContext: any = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer token.revocado.jwt' },
        }),
      }),
    };

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(blacklistServiceMock.isRevoked).toHaveBeenCalledWith('jti-revocado-999');
  });
});