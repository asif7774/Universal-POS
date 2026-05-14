import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * Manual JWT guard — replaces @nestjs/passport AuthGuard('jwt')
 * which has a breaking change in @nestjs/passport@11 with passport-jwt@4.
 */
@Injectable()
export class JwtAuthGuard {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Record<string, unknown>>();
    const auth = (request['headers'] as Record<string, string>)['authorization'];
    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Bearer token');
    }
    const token = auth.slice(7);
    try {
      const payload = this.jwtService.verify(token) as Record<string, unknown>;
      request['user'] = {
        id: payload['sub'],
        email: payload['email'],
        role: payload['role'],
        tenantId: payload['tenantId'],
        storeId: payload['storeId'],
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
