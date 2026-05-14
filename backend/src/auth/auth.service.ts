import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    // TODO: Replace with bcrypt.compare when DB is connected
    const valid = user.passwordHash === password;
    if (!valid) return null;
    const { passwordHash: _pw, ...result } = user;
    return result;
  }

  async validatePin(pin: string) {
    const user = await this.usersService.findByPin(pin);
    if (!user) throw new UnauthorizedException('Invalid PIN');
    const { passwordHash: _pw, pinHash: _pin, ...result } = user;
    return result;
  }

  async login(user: Record<string, unknown>) {
    const payload = {
      sub: user['id'],
      email: user['email'],
      role: user['role'],
      tenantId: user['tenantId'],
      storeId: user['storeId'],
    };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async loginWithPin(pin: string) {
    const user = await this.validatePin(pin);
    return this.login(user as Record<string, unknown>);
  }
}
