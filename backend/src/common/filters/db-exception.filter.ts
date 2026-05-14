import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class DbExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Check for Postgres unique constraint violation
    if (exception.code === '23505') {
      const detail = exception.detail || '';
      let message = 'A record with this information already exists.';
      if (detail.includes('email')) {
        message = 'A user or customer with this email already exists.';
      } else if (detail.includes('phone')) {
        message = 'A customer with this phone number already exists.';
      } else if (detail.includes('slug')) {
        message = 'A tenant with this slug already exists.';
      }

      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message,
        error: 'Conflict',
      });
    }

    // Default error handling for non-DB errors, or generic server error
    const status = exception.getStatus ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception.message || 'Internal server error';

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
