import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger, HttpStatus } from '@nestjs/common';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const responce = ctx.getResponse();
    const status = exception.getStatus ? exception.getStatus() :  HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponce = {
      code: status,
      timestamp: new Date().toLocaleDateString(),
      path: request.url,
      method: request.method,
      message: (status !== HttpStatus.INTERNAL_SERVER_ERROR) ? exception.message.error || exception.message || null : 'Internal server error',
    };

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error(exception);
    }

    Logger.error(
      `${request.method} ${request.url}`,
      JSON.stringify(errorResponce),
      'ExceptionFilter',
    );

    responce.status(404).json(errorResponce);
  }
}
