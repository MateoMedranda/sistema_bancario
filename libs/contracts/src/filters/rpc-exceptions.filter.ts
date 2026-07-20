import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

type RpcErrorPayload = {
  statusCode: number;
  message: string | string[];
  error: string;
};

@Catch()
export class RpcExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcExceptionsFilter.name);

  catch(exception: unknown, _host: ArgumentsHost): Observable<never> {
    const payload = this.toPayload(exception);
    this.logger.error(
      `RPC ${payload.statusCode}: ${Array.isArray(payload.message) ? payload.message.join(', ') : payload.message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    return throwError(() => payload);
  }

  private toPayload(exception: unknown): RpcErrorPayload {
    if (exception instanceof RpcException) {
      const error = exception.getError();

      if (typeof error === 'object' && error !== null) {
        const payload = error as Partial<RpcErrorPayload>;
        return {
          statusCode: payload.statusCode ?? 500,
          message: payload.message ?? 'Error interno del microservicio',
          error: payload.error ?? 'RpcException',
        };
      }

      return {
        statusCode: 500,
        message: String(error),
        error: 'RpcException',
      };
    }

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const responseBody =
        typeof response === 'object' && response !== null
          ? (response as Partial<RpcErrorPayload>)
          : undefined;

      return {
        statusCode: exception.getStatus(),
        message: responseBody?.message ?? exception.message,
        error: responseBody?.error ?? exception.name,
      };
    }

    if (exception instanceof Error) {
      return {
        statusCode: 500,
        message: exception.message,
        error: exception.name,
      };
    }

    return {
      statusCode: 500,
      message: 'Error interno del microservicio',
      error: 'UnknownError',
    };
  }
}
