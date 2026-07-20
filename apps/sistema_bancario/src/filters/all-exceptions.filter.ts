import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const rpcError = this.extractRpcError(exception);
    const status = rpcError?.statusCode
      ?? (exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR);

    const message = rpcError
      ?? (exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Error interno del servidor' });

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: rpcError?.error,
      message:
        typeof message === 'string'
          ? message
          : (message as any).message || message,
    };

    this.logger.error(
      `${request.method} ${request.url} ${status}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json(errorResponse);
  }

  private extractRpcError(exception: unknown) {
    if (!exception || typeof exception !== 'object') {
      return null;
    }

    const candidates = [
      exception,
      (exception as any).error,
      (exception as any).response,
    ];

    for (const candidate of candidates) {
      if (!candidate || typeof candidate !== 'object') {
        continue;
      }

      const statusCode = Number(
        (candidate as any).statusCode ?? (candidate as any).status,
      );

      if (Number.isInteger(statusCode) && statusCode >= 400 && statusCode < 600) {
        return {
          statusCode,
          message: (candidate as any).message ?? 'Error del microservicio',
          error: (candidate as any).error ?? 'Microservice Error',
        };
      }
    }

    return null;
  }
}
