import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class UniformHttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const code = status === HttpStatus.BAD_REQUEST ? 'VALIDATION_ERROR' : status === HttpStatus.NOT_FOUND ? 'PACKAGE_NOT_FOUND' : 'INTERNAL_ERROR';
    const message = exception instanceof HttpException ? this.message(exception.getResponse()) : 'Internal server error';
    response.status(status).json({ error: { code, message } });
  }

  private message(value: string | object): string {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object' && 'message' in value) {
      const message = (value as { message?: string | string[] }).message;
      return Array.isArray(message) ? message.join('; ') : message ?? 'Request error';
    }
    return 'Request error';
  }
}